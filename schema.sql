-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- CHANNELS (Public for now, can be generic rooms)
create table public.channels (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.channels enable row level security;
create policy "Channels are viewable by everyone." on public.channels for select using (true);
create policy "Authenticated users can create channels." on public.channels for insert with check (auth.role() = 'authenticated');

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.channels(id) not null,
  user_id uuid references public.profiles(id) not null,
  content text check (char_length(content) > 0),
  inserted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;
create policy "Messages are viewable by everyone." on public.messages for select using (true);
create policy "Authenticated users can insert messages." on public.messages for insert with check (auth.role() = 'authenticated');

-- Handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA
insert into public.channels (slug) values ('general');
