
create type public.app_role as enum ('student','instructor','admin');

create table public.profiles (
  id uuid primary key,
  full_name text not null default 'Learner',
  email text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare r public.app_role;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  r := case when coalesce(new.raw_user_meta_data->>'role','student') = 'instructor' then 'instructor'::public.app_role else 'student'::public.app_role end;
  insert into public.user_roles (user_id, role) values (new.id, r) on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'General',
  difficulty text not null default 'Beginner',
  duration_hours integer not null default 4,
  thumbnail_url text,
  instructor_id uuid not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.courses to anon;
grant select, insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "courses public read" on public.courses for select using (true);
create policy "instructor manage own courses" on public.courses for all to authenticated
  using (instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create trigger courses_updated before update on public.courses for each row execute function public.set_updated_at();

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  content text not null default '',
  video_url text,
  duration_minutes integer not null default 10,
  order_index integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.lessons to anon;
grant select, insert, update, delete on public.lessons to authenticated;
grant all on public.lessons to service_role;
alter table public.lessons enable row level security;
create policy "lessons public read" on public.lessons for select using (true);
create policy "instructor manage own lessons" on public.lessons for all to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and (c.instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.courses c where c.id = course_id and (c.instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create trigger lessons_updated before update on public.lessons for each row execute function public.set_updated_at();

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed boolean not null default false,
  completed_at timestamptz,
  last_lesson_id uuid,
  unique (student_id, course_id)
);
grant select, insert, update, delete on public.enrollments to authenticated;
grant all on public.enrollments to service_role;
alter table public.enrollments enable row level security;
create policy "student own enrollments" on public.enrollments for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "instructor view course enrollments" on public.enrollments for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()));

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant all on public.lesson_progress to service_role;
alter table public.lesson_progress enable row level security;
create policy "student own progress" on public.lesson_progress for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "instructor view progress" on public.lesson_progress for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()));

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  pass_percentage integer not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.quizzes to anon;
grant select, insert, update, delete on public.quizzes to authenticated;
grant all on public.quizzes to service_role;
alter table public.quizzes enable row level security;
create policy "quizzes public read" on public.quizzes for select using (true);
create policy "instructor manage own quizzes" on public.quizzes for all to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and (c.instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.courses c where c.id = course_id and (c.instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create trigger quizzes_updated before update on public.quizzes for each row execute function public.set_updated_at();

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null,
  order_index integer not null default 1,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.questions to authenticated;
grant all on public.questions to service_role;
alter table public.questions enable row level security;
create policy "instructor manage own questions" on public.questions for all to authenticated
  using (exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and (c.instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and (c.instructor_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  percentage integer not null,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.quiz_attempts to authenticated;
grant all on public.quiz_attempts to service_role;
alter table public.quiz_attempts enable row level security;
create policy "student own attempts" on public.quiz_attempts for select to authenticated using (student_id = auth.uid());
create policy "instructor view attempts" on public.quiz_attempts for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()));

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  unique (student_id, course_id)
);
grant select on public.certificates to authenticated;
grant all on public.certificates to service_role;
alter table public.certificates enable row level security;
create policy "student own certificates" on public.certificates for select to authenticated
  using (student_id = auth.uid() or public.has_role(auth.uid(),'admin'));

insert into public.profiles (id, full_name, email, bio)
values ('00000000-0000-4000-8000-000000000001','Dr. Anita Rao','instructor@learno.dev','Computer science educator specialising in databases and systems.');

insert into public.courses (id, title, description, category, difficulty, duration_hours, instructor_id, thumbnail_url) values
('10000000-0000-4000-8000-000000000001','Python Programming Fundamentals','Start from zero and build a solid foundation in Python: syntax, data types, control flow, functions, and working with files. Every module ends with hands-on practice.','Programming','Beginner',12,'00000000-0000-4000-8000-000000000001',null),
('10000000-0000-4000-8000-000000000002','Web Development with HTML, CSS and JavaScript','Build responsive, accessible websites from scratch. Learn semantic HTML, modern CSS layout with flexbox and grid, and interactive behaviour with JavaScript and the DOM.','Web Development','Beginner',16,'00000000-0000-4000-8000-000000000001',null),
('10000000-0000-4000-8000-000000000003','Database Management Systems','Understand relational modelling, SQL, normalization, indexing and transactions. Designed for students preparing for university exams and technical interviews.','Databases','Intermediate',20,'00000000-0000-4000-8000-000000000001',null),
('10000000-0000-4000-8000-000000000004','Machine Learning Basics','A practical introduction to supervised and unsupervised learning: regression, classification, model evaluation, overfitting and the typical ML workflow.','Data Science','Intermediate',18,'00000000-0000-4000-8000-000000000001',null),
('10000000-0000-4000-8000-000000000005','Computer Networks','From physical signals to HTTP. Explore the layered network model, IP addressing, routing, TCP reliability and the protocols that power the modern internet.','Computer Science','Advanced',22,'00000000-0000-4000-8000-000000000001',null);

insert into public.lessons (course_id, title, description, content, duration_minutes, order_index) values
('10000000-0000-4000-8000-000000000001','Getting Started with Python','Install Python and run your first program.','Python is an interpreted, high-level language known for readable syntax. After installing Python 3 you can run code in two ways: interactively in the REPL, or by saving a .py file and running it with the interpreter. Your first program is traditionally print("Hello, Learno!"). Indentation is significant in Python: blocks are defined by whitespace rather than braces, which forces consistently readable code.',15,1),
('10000000-0000-4000-8000-000000000001','Variables and Data Types','Numbers, strings, booleans and dynamic typing.','Python variables are names bound to objects; you never declare a type. Core built-in types are int, float, str, bool and NoneType. Strings are immutable sequences supporting slicing (s[0:3]) and formatting with f-strings. Use type() to inspect a value and int(), float(), str() to convert between types. Because typing is dynamic but strong, "2" + 2 raises a TypeError rather than guessing your intent.',20,2),
('10000000-0000-4000-8000-000000000001','Control Flow and Loops','if/elif/else, for and while loops.','Decisions use if / elif / else with truthy evaluation: empty collections, 0 and None are falsy. The for loop iterates over any iterable, commonly range(n) or a list. The while loop repeats until a condition becomes false. break exits a loop early, continue skips to the next iteration, and the optional else clause on a loop runs only when no break occurred.',25,3),
('10000000-0000-4000-8000-000000000001','Functions and Modules','Reusable code with def, arguments and imports.','A function is defined with def name(params): and returns a value with return. Parameters may have defaults, and *args / **kwargs capture variable arguments. Group related functions into a module (a .py file) and reuse them with import. The if __name__ == "__main__": guard lets a file act as both a script and an importable module.',20,4),
('10000000-0000-4000-8000-000000000001','Working with Files and Errors','Reading, writing and handling exceptions.','Open files with the with statement so they close automatically: with open("data.txt") as f. Use modes "r", "w" and "a". Wrap risky operations in try / except blocks and catch specific exceptions such as FileNotFoundError or ValueError instead of bare except. finally always runs, making it ideal for cleanup.',20,5);

insert into public.lessons (course_id, title, description, content, duration_minutes, order_index) values
('10000000-0000-4000-8000-000000000002','Semantic HTML Structure','Document structure and meaningful elements.','HTML describes meaning, not appearance. A well-structured page uses header, nav, main, section, article, aside and footer so assistive technology and search engines can understand it. Headings must follow a logical order with exactly one h1 per page. Every image needs alt text, and form inputs need associated labels.',20,1),
('10000000-0000-4000-8000-000000000002','CSS Layout: Flexbox and Grid','Modern responsive layout techniques.','Flexbox lays out items along a single axis: display:flex plus justify-content and align-items solve most alignment problems. CSS Grid handles two dimensions with grid-template-columns and gap. Combine them with media queries and relative units (rem, %, fr, minmax) to build layouts that adapt from mobile to desktop without fixed pixel widths.',30,2),
('10000000-0000-4000-8000-000000000002','JavaScript Essentials','Variables, functions and the DOM.','Declare variables with let and const, never var. Functions can be declarations or arrow functions, and arrays offer map, filter and reduce for transformation. The DOM API lets scripts read and change the page: document.querySelector finds elements, addEventListener responds to user events, and textContent or classList updates them safely.',30,3),
('10000000-0000-4000-8000-000000000002','Fetching Data and Async JavaScript','Promises, async/await and APIs.','Network requests are asynchronous. fetch() returns a Promise which resolves to a Response; call response.json() to read the body. async/await makes this read like synchronous code, and try/catch handles network failures. Always check response.ok before parsing, and show the user a loading state while the request is in flight.',25,4);

insert into public.lessons (course_id, title, description, content, duration_minutes, order_index) values
('10000000-0000-4000-8000-000000000003','The Relational Model','Tables, keys and relationships.','A relational database stores data in relations (tables) of tuples (rows) with named attributes (columns). A primary key uniquely identifies each row; a foreign key references the primary key of another table and enforces referential integrity. Relationships are one-to-one, one-to-many or many-to-many, the last modelled with a junction table holding two foreign keys.',25,1),
('10000000-0000-4000-8000-000000000003','SQL Queries and Joins','SELECT, WHERE, GROUP BY and joins.','SQL is declarative: you describe the result, the optimizer decides how. SELECT chooses columns, WHERE filters rows before grouping, GROUP BY aggregates, and HAVING filters groups. INNER JOIN returns matching rows from both tables, LEFT JOIN keeps every row from the left table with NULLs where no match exists. ORDER BY and LIMIT shape the final output.',35,2),
('10000000-0000-4000-8000-000000000003','Normalization','1NF through BCNF and why it matters.','Normalization organises columns to eliminate redundancy and update anomalies. First normal form requires atomic values. Second normal form removes partial dependencies on part of a composite key. Third normal form removes transitive dependencies, so every non-key attribute depends on the key, the whole key and nothing but the key. BCNF strengthens 3NF when multiple candidate keys overlap. Denormalization is a deliberate later trade-off for read performance.',30,3),
('10000000-0000-4000-8000-000000000003','Indexing and Query Performance','How indexes speed up reads.','An index is an auxiliary structure, usually a B-tree, that lets the engine find rows without scanning the whole table. Index columns used in WHERE, JOIN and ORDER BY clauses. Indexes cost write performance and storage, so they are a trade-off. Use EXPLAIN to inspect the query plan and confirm whether a sequential scan or an index scan is used.',25,4),
('10000000-0000-4000-8000-000000000003','Transactions and ACID','Concurrency, isolation and reliability.','A transaction groups statements into one atomic unit committed or rolled back together. ACID stands for Atomicity, Consistency, Isolation and Durability. Isolation levels trade correctness against concurrency: read committed prevents dirty reads, repeatable read prevents non-repeatable reads, serializable prevents phantoms. Deadlocks occur when transactions wait on each other and the engine aborts one.',30,5);

insert into public.lessons (course_id, title, description, content, duration_minutes, order_index) values
('10000000-0000-4000-8000-000000000004','What is Machine Learning?','Supervised, unsupervised and reinforcement learning.','Machine learning builds models that improve from data instead of explicit rules. In supervised learning each example carries a label and the model learns a mapping from features to that label. Unsupervised learning finds structure such as clusters in unlabelled data. Reinforcement learning optimises actions through reward signals. Choosing the paradigm depends on what data and feedback you actually have.',20,1),
('10000000-0000-4000-8000-000000000004','Regression and Classification','Predicting numbers and categories.','Regression predicts continuous values; linear regression fits coefficients minimising squared error. Classification predicts discrete classes; logistic regression outputs a probability through the sigmoid function, and decision trees split the feature space by thresholds. The choice of loss function defines what the model considers a good prediction.',30,2),
('10000000-0000-4000-8000-000000000004','Model Evaluation','Train/test splits and metrics.','Never evaluate on training data. Split into train, validation and test sets, or use k-fold cross-validation for small datasets. Regression uses MAE, RMSE and R squared. Classification uses accuracy, precision, recall and F1; accuracy alone is misleading for imbalanced classes. A confusion matrix reveals which errors the model makes.',25,3),
('10000000-0000-4000-8000-000000000004','Overfitting and Regularization','Bias, variance and generalisation.','Overfitting means the model memorises noise: low training error, high test error. Underfitting means it is too simple to capture the pattern. This is the bias-variance trade-off. Remedies include more data, fewer features, L1/L2 regularization which penalises large weights, early stopping, and ensembling methods such as random forests.',25,4);

insert into public.lessons (course_id, title, description, content, duration_minutes, order_index) values
('10000000-0000-4000-8000-000000000005','Network Models and Layers','OSI and TCP/IP layering.','Layering splits networking into independent responsibilities. The OSI model defines seven layers; the practical TCP/IP model has four: link, internet, transport and application. Each layer adds a header through encapsulation and talks logically to its peer on the other host. Layering is why you can change Wi-Fi for Ethernet without rewriting a web browser.',25,1),
('10000000-0000-4000-8000-000000000005','IP Addressing and Subnetting','IPv4, CIDR and routing basics.','An IPv4 address is 32 bits split into network and host portions by a subnet mask, written in CIDR notation such as 192.168.1.0/24. Subnetting divides an address block into smaller networks. Routers forward packets hop by hop using a longest-prefix-match routing table. NAT lets many private addresses share one public address, and IPv6 removes that scarcity with 128-bit addresses.',30,2),
('10000000-0000-4000-8000-000000000005','TCP, UDP and Reliability','Transport layer guarantees.','TCP provides a reliable ordered byte stream using a three-way handshake, sequence numbers, acknowledgements, retransmission, flow control via the receive window and congestion control. UDP is connectionless with no delivery guarantee but minimal overhead, which suits DNS, gaming and real-time media where late data is useless.',30,3),
('10000000-0000-4000-8000-000000000005','Application Protocols and HTTP','DNS, HTTP and TLS in practice.','DNS resolves names to addresses through a hierarchy of recursive and authoritative servers. HTTP is a request/response protocol with methods, status codes and headers; it is stateless, so sessions rely on cookies or tokens. HTTPS wraps HTTP in TLS, which authenticates the server with a certificate and encrypts the channel. HTTP/2 adds multiplexing over one connection.',30,4);

insert into public.quizzes (id, course_id, title, description, pass_percentage) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Python Fundamentals Quiz','Check your understanding of Python syntax, types and control flow.',60),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Web Development Quiz','Test your HTML, CSS and JavaScript knowledge.',60),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','DBMS Concepts Quiz','Relational modelling, SQL, normalization and transactions.',60),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','Machine Learning Basics Quiz','Core ML concepts and evaluation.',60),
('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','Computer Networks Quiz','Layers, addressing and transport protocols.',60);

insert into public.questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) values
('20000000-0000-4000-8000-000000000001','Which keyword defines a function in Python?','func','def','function','lambda','B',1),
('20000000-0000-4000-8000-000000000001','What does Python use to define a block of code?','Curly braces','Parentheses','Indentation','Semicolons','C',2),
('20000000-0000-4000-8000-000000000001','What is the result of type(3.0) in Python?','int','float','decimal','number','B',3),
('20000000-0000-4000-8000-000000000001','Which statement stops a loop immediately?','continue','pass','return','break','D',4),
('20000000-0000-4000-8000-000000000001','Which block always runs after a try/except?','finally','else','ensure','always','A',5),
('20000000-0000-4000-8000-000000000001','What does "2" + 2 produce in Python?','4','"22"','A TypeError','None','C',6),
('20000000-0000-4000-8000-000000000002','Which HTML element represents the main content of a page?','<div>','<main>','<body>','<section>','B',1),
('20000000-0000-4000-8000-000000000002','Which CSS display value creates a one-dimensional flexible layout?','grid','block','flex','inline','C',2),
('20000000-0000-4000-8000-000000000002','Which method selects the first matching element in the DOM?','document.getElement()','document.querySelector()','document.findOne()','document.select()','B',3),
('20000000-0000-4000-8000-000000000002','What does fetch() return?','A JSON object','A string','A Promise','An array','C',4),
('20000000-0000-4000-8000-000000000002','Which attribute makes an image accessible to screen readers?','title','alt','aria-image','caption','B',5),
('20000000-0000-4000-8000-000000000003','Which key uniquely identifies each row in a table?','Foreign key','Primary key','Candidate index','Composite column','B',1),
('20000000-0000-4000-8000-000000000003','Which normal form removes transitive dependencies?','1NF','2NF','3NF','BCNF','C',2),
('20000000-0000-4000-8000-000000000003','Which join keeps all rows from the left table?','INNER JOIN','LEFT JOIN','CROSS JOIN','FULL JOIN','B',3),
('20000000-0000-4000-8000-000000000003','What does the I in ACID stand for?','Integrity','Indexing','Isolation','Immutability','C',4),
('20000000-0000-4000-8000-000000000003','Which clause filters rows before grouping?','HAVING','WHERE','ORDER BY','LIMIT','B',5),
('20000000-0000-4000-8000-000000000003','What is the main cost of adding an index?','Slower reads','Slower writes and extra storage','Loss of integrity','Longer transactions','B',6),
('20000000-0000-4000-8000-000000000004','Which learning type uses labelled data?','Unsupervised','Supervised','Reinforcement','Generative','B',1),
('20000000-0000-4000-8000-000000000004','Which metric is misleading on imbalanced classes?','Recall','Precision','Accuracy','F1 score','C',2),
('20000000-0000-4000-8000-000000000004','Overfitting typically shows which pattern?','High train error, high test error','Low train error, high test error','Low train error, low test error','High train error, low test error','B',3),
('20000000-0000-4000-8000-000000000004','Which technique penalises large model weights?','Normalization','Regularization','Tokenization','Clustering','B',4),
('20000000-0000-4000-8000-000000000004','Which algorithm outputs a probability using the sigmoid function?','Linear regression','K-means','Logistic regression','PCA','C',5),
('20000000-0000-4000-8000-000000000005','How many layers does the OSI model define?','4','5','7','9','C',1),
('20000000-0000-4000-8000-000000000005','What does /24 mean in CIDR notation?','24 usable hosts','24 network bits','24 subnets','24 routers','B',2),
('20000000-0000-4000-8000-000000000005','Which protocol is connectionless?','TCP','UDP','TLS','FTP','B',3),
('20000000-0000-4000-8000-000000000005','What establishes a TCP connection?','Two-way handshake','Three-way handshake','Broadcast request','ARP request','B',4),
('20000000-0000-4000-8000-000000000005','Which protocol resolves domain names to IP addresses?','DHCP','DNS','ICMP','SMTP','B',5);
