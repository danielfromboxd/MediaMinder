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

--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genres (id, name, media_type) FROM stdin;
1	Sci-Fi	movie
2	Dystopian	book
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, external_id, type, title, genre, release_date, image_url, director, runtime, creator, number_of_seasons, episodes_per_season, author, page_count, publisher) FROM stdin;
1	ext_001	movie	Inception	Sci-Fi	2010-07-16	http://example.com/inception.jpg	Christopher Nolan	148	\N	\N	\N	\N	\N	\N
2	ext_002	book	1984	Dystopian	1949-06-08	http://example.com/1984.jpg	\N	\N	\N	\N	\N	George Orwell	328	Secker & Warburg
3	rec-3	movie	Inception	\N	\N	https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg	\N	\N	\N	\N	\N	\N	\N	\N
4	pop-1	movie	Dune: Part Two	\N	\N	https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg	\N	\N	\N	\N	\N	\N	\N	\N
5	1	movie	Inception	\N	\N	https://image.tmdb.org/t/p/w500https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg	\N	\N	\N	\N	\N	\N	\N	\N
7	135934	series	The Legend of Vox Machina	\N	\N	https://image.tmdb.org/t/p/w500/b5A0qkGrZJTyVv3gT6b8clFEz9R.jpg	\N	\N	\N	\N	\N	\N	\N	\N
8	/works/OL27448W	book	The Lord of the Rings	\N	\N	https://covers.openlibrary.org/b/id/14625765-M.jpg	\N	\N	\N	\N	\N	\N	\N	\N
9	/works/OL27969037W	book	Homo Deus	\N	\N	https://covers.openlibrary.org/b/id/14421556-M.jpg	\N	\N	\N	\N	\N	\N	\N	\N
10	/works/OL27495W	book	The Silmarillion	\N	\N	https://covers.openlibrary.org/b/id/14627042-M.jpg	\N	\N	\N	\N	\N	\N	\N	\N
11	71024	series	Castlevania	\N	\N	https://image.tmdb.org/t/p/w500/ubDtIBwdS9b29sBofAkqWz3PqkT.jpg	\N	\N	\N	\N	\N	\N	\N	\N
12	817758	movie	TÁR	\N	\N	https://image.tmdb.org/t/p/w500/dRVAlaU0vbG6hMf2K45NSiIyoUe.jpg	\N	\N	\N	\N	\N	\N	\N	\N
13	97113	series	The Three-Body Problem	\N	\N	https://image.tmdb.org/t/p/w500/2IpjdDLbvDZg2EO3DDqqa01QknQ.jpg	\N	\N	\N	\N	\N	\N	\N	\N
14	122917	movie	The Hobbit: The Battle of the Five Armies	\N	\N	https://image.tmdb.org/t/p/w500/xT98tLqatZPQApyRmlPL12LtiWp.jpg	\N	\N	\N	\N	\N	\N	\N	\N
15	/works/OL27691456W	book	The Last Wish	\N	\N	https://covers.openlibrary.org/b/id/12855306-M.jpg	\N	\N	\N	\N	\N	\N	\N	\N
16	117488	series	Yellowjackets	\N	\N	https://image.tmdb.org/t/p/w500/bYr4kBf26aa1eEtOnOLpjDmKPVX.jpg	\N	\N	\N	\N	\N	\N	\N	\N
17	61664	series	Sense8	\N	\N	https://image.tmdb.org/t/p/w500/kmyvlQ9QKzgdZY31rXaUlgCnzrB.jpg	\N	\N	\N	\N	\N	\N	\N	\N
18	27205	movie	Inception	\N	\N	https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg	\N	\N	\N	\N	\N	\N	\N	\N
19	pop-2	series	House of the Dragon	\N	\N	https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg	\N	\N	\N	\N	\N	\N	\N	\N
20	/works/OL17641518W	book	ההיסטוריה של המחר	\N	\N	https://covers.openlibrary.org/b/id/7914168-M.jpg	\N	\N	\N	\N	\N	\N	\N	\N
21	/works/OL31276531W	book	Zulajka opent haar ogen	\N	\N	https://covers.openlibrary.org/b/id/13618596-M.jpg	\N	\N	\N	\N	\N	\N	\N	\N
22	4194	series	Star Wars: The Clone Wars	\N	\N	https://image.tmdb.org/t/p/w500/e1nWfnnCVqxS2LeTO3dwGyAsG2V.jpg	\N	\N	\N	\N	\N	\N	\N	\N
23	22	series	Star Wars: The Clone Wars	\N	\N	https://image.tmdb.org/t/p/w500https://image.tmdb.org/t/p/w500/e1nWfnnCVqxS2LeTO3dwGyAsG2V.jpg	\N	\N	\N	\N	\N	\N	\N	\N
24	5	series	The Legend of Vox Machina	\N	\N	https://image.tmdb.org/t/p/w500https://image.tmdb.org/t/p/w500/b5A0qkGrZJTyVv3gT6b8clFEz9R.jpg	\N	\N	\N	\N	\N	\N	\N	\N
25	18165	series	The Vampire Diaries	\N	\N	https://image.tmdb.org/t/p/w500/b3vl6wV1W8PBezFfntKTrhrehCY.jpg	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: media_genres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_genres (media_id, genre_id) FROM stdin;
1	1
2	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, created_at, is_private) FROM stdin;
1	john_doe	john@example.com	hashed_password_1	2025-02-26 17:45:34.070891	t
2	jane_doe	jane@example.com	hashed_password_2	2025-02-26 17:45:34.070891	t
3	luxko	lxulgxfug@gmail.com	scrypt:32768:8:1$WU60HTO96bvwrPBa$5a6cbb5f1f12a46ebf336efa38837bfdcfcf3d35ad59a5f13f3e18a8ca6bb46d1b582308ca5ccf1f46d0833cfa0df203e98729ab7ea7ac0c8b6514b88d1dedc8	2025-03-14 11:20:05.924113	t
5	snooks	kovacslux@gmail.com	scrypt:32768:8:1$JKQ9lILgaN3BPtxf$6b1892f49000c5a7b5cfbf1c891b50f7e43fe0ea2e191a186fb387ecf41f7d68445cdbf8f105361bf93672138c038a9e49d9bc7161132cc26431678a294754c1	2025-03-14 18:05:43.339479	t
4	lucanowak	lucanowak@outlook.com	scrypt:32768:8:1$BrOKbM0bEUXyvtQq$dc0ac20264563b8a29dd4b0aea337176eb7c354aa920038bb6b45c12b4a05dff29dbfcf53f81852a0d43684a73458b3fd6c3628f570a9fef6b188cbc717e60b3	2025-03-14 11:25:46.533771	t
\.


--
-- Data for Name: media_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_items (id, user_id, media_id, title, media_type, status, rating, review, poster_path, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_media (id, user_id, media_id, status, rating, review, updated_at) FROM stdin;
1	5	3	in_progress	\N	\N	2025-03-14 18:19:37.885299
2	5	4	finished	\N	\N	2025-03-14 18:20:01.8756
7	4	8	finished	\N	\N	2025-03-15 17:37:38.548199
8	4	9	in_progress	\N	\N	2025-03-15 17:37:56.778011
12	4	13	want_to_view	\N	\N	2025-03-16 10:33:37.255395
14	4	15	finished	\N	\N	2025-03-16 10:54:26.746749
15	4	10	want_to_view	\N	\N	2025-03-16 10:55:09.875575
16	4	16	want_to_view	\N	\N	2025-03-16 12:57:33.534658
19	4	19	want_to_view	\N	\N	2025-03-16 18:03:07.083258
20	4	20	want_to_view	\N	\N	2025-03-16 18:13:17.33976
22	4	22	in_progress	\N	\N	2025-03-16 18:16:59.708154
5	4	7	finished	5	\N	2025-03-16 18:26:55.973336
21	4	21	finished	4	\N	2025-03-16 18:27:03.843726
17	4	17	finished	5	\N	2025-03-16 18:27:15.114136
13	4	14	finished	3	\N	2025-03-16 18:27:19.141769
23	4	12	want_to_view	\N	\N	2025-03-16 18:59:31.753224
26	4	25	in_progress	5	\N	2025-03-17 14:48:46.87339
\.


--
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.genres_id_seq', 2, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 25, true);


--
-- Name: media_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_items_id_seq', 1, false);


--
-- Name: user_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_media_id_seq', 26, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

