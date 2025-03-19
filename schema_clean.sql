--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_media DROP CONSTRAINT IF EXISTS user_media_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_media DROP CONSTRAINT IF EXISTS user_media_media_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_items DROP CONSTRAINT IF EXISTS media_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_genres DROP CONSTRAINT IF EXISTS media_genres_media_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_genres DROP CONSTRAINT IF EXISTS media_genres_genre_id_fkey;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_user_media_user;
DROP INDEX IF EXISTS public.idx_user_media_media;
DROP INDEX IF EXISTS public.idx_user_media_composite;
DROP INDEX IF EXISTS public.idx_media_genres_media;
DROP INDEX IF EXISTS public.idx_media_genres_genre;
DROP INDEX IF EXISTS public.idx_media_genres_composite;
DROP INDEX IF EXISTS public.idx_media_external_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_media DROP CONSTRAINT IF EXISTS user_media_user_id_media_id_key;
ALTER TABLE IF EXISTS ONLY public.user_media DROP CONSTRAINT IF EXISTS user_media_pkey;
ALTER TABLE IF EXISTS ONLY public.media DROP CONSTRAINT IF EXISTS media_pkey;
ALTER TABLE IF EXISTS ONLY public.media_items DROP CONSTRAINT IF EXISTS media_items_pkey;
ALTER TABLE IF EXISTS ONLY public.media_genres DROP CONSTRAINT IF EXISTS media_genres_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS genres_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS genres_name_key;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_media ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.media_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.media ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.genres ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_media_id_seq;
DROP TABLE IF EXISTS public.user_media;
DROP SEQUENCE IF EXISTS public.media_items_id_seq;
DROP TABLE IF EXISTS public.media_items;
DROP SEQUENCE IF EXISTS public.media_id_seq;
DROP TABLE IF EXISTS public.media_genres;
DROP TABLE IF EXISTS public.media;
DROP SEQUENCE IF EXISTS public.genres_id_seq;
DROP TABLE IF EXISTS public.genres;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: genres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    media_type character varying(20),
    CONSTRAINT genres_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['movie'::character varying, 'series'::character varying, 'book'::character varying])::text[])))
);


ALTER TABLE public.genres OWNER TO postgres;

--
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.genres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_id_seq OWNER TO postgres;

--
-- Name: genres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.genres_id_seq OWNED BY public.genres.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    external_id character varying(50) NOT NULL,
    type character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    genre character varying(50),
    release_date date,
    image_url character varying(255),
    director character varying(100),
    runtime integer,
    creator character varying(100),
    number_of_seasons integer,
    episodes_per_season integer,
    author character varying(100),
    page_count integer,
    publisher character varying(100),
    CONSTRAINT media_type_check CHECK (((type)::text = ANY ((ARRAY['movie'::character varying, 'series'::character varying, 'book'::character varying])::text[])))
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_genres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_genres (
    media_id integer NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.media_genres OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: media_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    media_id character varying(100) NOT NULL,
    title character varying(200) NOT NULL,
    media_type character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    rating integer,
    review text,
    poster_path character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.media_items OWNER TO postgres;

--
-- Name: media_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_items_id_seq OWNER TO postgres;

--
-- Name: media_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_items_id_seq OWNED BY public.media_items.id;


--
-- Name: user_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_media (
    id integer NOT NULL,
    user_id integer NOT NULL,
    media_id integer NOT NULL,
    status character varying(20) NOT NULL,
    rating integer,
    review text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT user_media_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT user_media_status_check CHECK (((status)::text = ANY ((ARRAY['want_to_view'::character varying, 'in_progress'::character varying, 'finished'::character varying])::text[])))
);


ALTER TABLE public.user_media OWNER TO postgres;

--
-- Name: user_media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_media_id_seq OWNER TO postgres;

--
-- Name: user_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_media_id_seq OWNED BY public.user_media.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_private boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: genres id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres ALTER COLUMN id SET DEFAULT nextval('public.genres_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: media_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_items ALTER COLUMN id SET DEFAULT nextval('public.media_items_id_seq'::regclass);


--
-- Name: user_media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_media ALTER COLUMN id SET DEFAULT nextval('public.user_media_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: media_genres media_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_genres
    ADD CONSTRAINT media_genres_pkey PRIMARY KEY (media_id, genre_id);


--
-- Name: media_items media_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_items
    ADD CONSTRAINT media_items_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: user_media user_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_media
    ADD CONSTRAINT user_media_pkey PRIMARY KEY (id);


--
-- Name: user_media user_media_user_id_media_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_media
    ADD CONSTRAINT user_media_user_id_media_id_key UNIQUE (user_id, media_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_media_external_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_external_id ON public.media USING btree (external_id);


--
-- Name: idx_media_genres_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_genres_composite ON public.media_genres USING btree (media_id, genre_id);


--
-- Name: idx_media_genres_genre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_genres_genre ON public.media_genres USING btree (genre_id);


--
-- Name: idx_media_genres_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_genres_media ON public.media_genres USING btree (media_id);


--
-- Name: idx_user_media_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_media_composite ON public.user_media USING btree (user_id, media_id);


--
-- Name: idx_user_media_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_media_media ON public.user_media USING btree (media_id);


--
-- Name: idx_user_media_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_media_user ON public.user_media USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: media_genres media_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_genres
    ADD CONSTRAINT media_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id);


--
-- Name: media_genres media_genres_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_genres
    ADD CONSTRAINT media_genres_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id);


--
-- Name: media_items media_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_items
    ADD CONSTRAINT media_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_media user_media_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_media
    ADD CONSTRAINT user_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id);


--
-- Name: user_media user_media_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_media
    ADD CONSTRAINT user_media_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

