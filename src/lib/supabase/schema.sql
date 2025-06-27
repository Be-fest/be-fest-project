-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('client', 'provider', 'admin');
create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type service_status as enum ('active', 'inactive');
create type booking_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed');

-- Create tables
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role user_role not null default 'client',
    full_name text,
    phone text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.provider_profiles (
    id uuid references profiles(id) on delete cascade primary key,
    business_name text not null,
    description text,
    category text,
    address text,
    city text,
    state text,
    rating numeric(3,2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.events (
    id uuid default uuid_generate_v4() primary key,
    client_id uuid references profiles(id) on delete cascade not null,
    title text not null,
    description text,
    date timestamp with time zone not null,
    location text,
    status event_status default 'draft',
    guest_count integer default 0,
    budget numeric(10,2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.services (
    id uuid default uuid_generate_v4() primary key,
    provider_id uuid references provider_profiles(id) on delete cascade not null,
    name text not null,
    description text,
    category text not null,
    base_price numeric(10,2) not null,
    min_guests integer default 0,
    max_guests integer,
    status service_status default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.bookings (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references events(id) on delete cascade not null,
    service_id uuid references services(id) on delete cascade not null,
    status booking_status default 'pending',
    price numeric(10,2) not null,
    guest_count integer not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(event_id, service_id)
);

-- Create triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_updated_at_column();

create trigger update_provider_profiles_updated_at
    before update on provider_profiles
    for each row
    execute function update_updated_at_column();

create trigger update_events_updated_at
    before update on events
    for each row
    execute function update_updated_at_column();

create trigger update_services_updated_at
    before update on services
    for each row
    execute function update_updated_at_column();

create trigger update_bookings_updated_at
    before update on bookings
    for each row
    execute function update_updated_at_column();

-- Create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.events enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using (true);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- Provider profiles policies
create policy "Provider profiles are viewable by everyone"
    on provider_profiles for select
    using (true);

create policy "Providers can update own profile"
    on provider_profiles for update
    using (auth.uid() = id);

create policy "Providers can insert own profile"
    on provider_profiles for insert
    with check (auth.uid() = id);

-- Events policies
create policy "Users can view own events"
    on events for select
    using (auth.uid() = client_id);

create policy "Providers can view events with their services"
    on events for select
    using (
        exists (
            select 1 from bookings b
            join services s on b.service_id = s.id
            where b.event_id = events.id
            and s.provider_id = auth.uid()
        )
    );

create policy "Users can create own events"
    on events for insert
    with check (auth.uid() = client_id);

create policy "Users can update own events"
    on events for update
    using (auth.uid() = client_id);

create policy "Users can delete own events"
    on events for delete
    using (auth.uid() = client_id);

-- Services policies
create policy "Services are viewable by everyone"
    on services for select
    using (true);

create policy "Providers can manage own services"
    on services for all
    using (auth.uid() = provider_id);

-- Bookings policies
create policy "Users can view own bookings"
    on bookings for select
    using (
        exists (
            select 1 from events e
            where e.id = bookings.event_id
            and e.client_id = auth.uid()
        )
    );

create policy "Providers can view bookings for their services"
    on bookings for select
    using (
        exists (
            select 1 from services s
            where s.id = bookings.service_id
            and s.provider_id = auth.uid()
        )
    );

create policy "Users can create bookings for own events"
    on bookings for insert
    with check (
        exists (
            select 1 from events e
            where e.id = bookings.event_id
            and e.client_id = auth.uid()
        )
    );

create policy "Users and providers can update relevant bookings"
    on bookings for update
    using (
        exists (
            select 1 from events e
            where e.id = bookings.event_id
            and e.client_id = auth.uid()
        )
        or
        exists (
            select 1 from services s
            where s.id = bookings.service_id
            and s.provider_id = auth.uid()
        )
    ); 