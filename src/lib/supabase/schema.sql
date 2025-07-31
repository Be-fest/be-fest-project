-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- Create users table
create table users (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('client', 'provider', 'admin')),
  full_name text,
  email text,
  organization_name text,
  cnpj text,
  whatsapp_number text,
  profile_image text,
  area_of_operation text,
  address text,
  city text,
  state text,
  postal_code text,
  profile_image text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create services table
create table services (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references users(id) on delete cascade not null,
  name text not null,
  description text,
  category text not null,
  base_price numeric(10,2) not null,
  price_per_guest numeric(10,2),
  min_guests integer,
  max_guests integer,
  images_urls text[],
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create events table
create table events (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references users(id) on delete cascade not null,
  title text not null,
  description text,
  event_date date not null,
  start_time time without time zone,
  location text,
  guest_count integer,
  full_guests integer default 0,
  half_guests integer default 0,
  free_guests integer default 0,
  budget numeric(10,2),
  status text default 'draft' check (status in ('draft', 'pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_services table
create table event_services (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  service_id uuid references services(id) on delete cascade not null,
  provider_id uuid references users(id) on delete cascade not null,
  price numeric(10,2) not null,
  guest_count integer,
  notes text,
  status text default 'pending' check (status in ('pending', 'waiting_payment', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create service_guest_tiers table
create table service_guest_tiers (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references services(id) on delete cascade not null,
  min_total_guests integer not null,
  max_total_guests integer,
  base_price_per_adult numeric(10,2) not null,
  tier_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create service_pricing_rules table
create table service_pricing_rules (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references services(id) on delete cascade not null,
  guest_type text not null check (guest_type in ('adult', 'child', 'baby')),
  min_age integer,
  max_age integer,
  price_multiplier numeric(3,2) not null,
  rule_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table users enable row level security;
alter table services enable row level security;
alter table events enable row level security;
alter table event_services enable row level security;
alter table categories enable row level security;
alter table service_guest_tiers enable row level security;
alter table service_pricing_rules enable row level security;

-- Users policies
create policy "Users can read their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id);

-- Services policies
create policy "Anyone can read active services"
  on services for select
  using (is_active = true);

create policy "Providers can CRUD their own services"
  on services for all
  using (auth.uid() = provider_id);

-- Events policies
create policy "Clients can read their own events"
  on events for select
  using (auth.uid() = client_id);

create policy "Clients can create events"
  on events for insert
  with check (auth.uid() = client_id);

create policy "Clients can update their own events"
  on events for update
  using (auth.uid() = client_id);

-- Event services policies
create policy "Clients can read their event services"
  on event_services for select
  using (exists (
    select 1 from events
    where events.id = event_id
    and events.client_id = auth.uid()
  ));

create policy "Providers can read their event services"
  on event_services for select
  using (provider_id = auth.uid());

create policy "Clients can create event services"
  on event_services for insert
  with check (exists (
    select 1 from events
    where events.id = event_id
    and events.client_id = auth.uid()
  ));

create policy "Providers can update their event services"
  on event_services for update
  using (provider_id = auth.uid());

-- Categories policies
create policy "Anyone can read categories"
  on categories for select
  using (true);

-- Service guest tiers policies
create policy "Anyone can read service guest tiers"
  on service_guest_tiers for select
  using (true);

create policy "Providers can CRUD their service guest tiers"
  on service_guest_tiers for all
  using (exists (
    select 1 from services
    where services.id = service_id
    and services.provider_id = auth.uid()
  ));

-- Service pricing rules policies
create policy "Anyone can read service pricing rules"
  on service_pricing_rules for select
  using (true);

create policy "Providers can CRUD their service pricing rules"
  on service_pricing_rules for all
  using (exists (
    select 1 from services
    where services.id = service_id
    and services.provider_id = auth.uid()
  ));

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, email)
  values (new.id, 'client', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();