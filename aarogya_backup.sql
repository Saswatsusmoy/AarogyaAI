--
-- PostgreSQL database dump
--

\restrict HFU4q80kwTQasYwCagR9QcbC2n3iZZKNHyOgY6kX4GRuVhcfjCEJYG6Zru9LW04

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: aarogya
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."AppointmentStatus" OWNER TO aarogya;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: aarogya
--

CREATE TYPE public."Role" AS ENUM (
    'doctor',
    'patient'
);


ALTER TYPE public."Role" OWNER TO aarogya;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    reason text,
    status public."AppointmentStatus" DEFAULT 'PENDING'::public."AppointmentStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "AI-Notes" text,
    prescription text,
    "prescriptionPdf" text,
    "recommendedTests" text
);


ALTER TABLE public."Appointment" OWNER TO aarogya;

--
-- Name: AppointmentTranscription; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."AppointmentTranscription" (
    id text NOT NULL,
    "appointmentId" text NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AppointmentTranscription" OWNER TO aarogya;

--
-- Name: ChatHistory; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."ChatHistory" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    message text NOT NULL,
    "isUser" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatHistory" OWNER TO aarogya;

--
-- Name: DoctorProfile; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."DoctorProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text,
    age integer,
    phone text,
    department text,
    speciality text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    signature text,
    "signatureType" text,
    "clinicAddress" text,
    "clinicName" text,
    "clinicPhone" text
);


ALTER TABLE public."DoctorProfile" OWNER TO aarogya;

--
-- Name: MedicalTests; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."MedicalTests" (
    "TestID" text NOT NULL,
    "TestName" text NOT NULL
);


ALTER TABLE public."MedicalTests" OWNER TO aarogya;

--
-- Name: PatientProfile; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."PatientProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text,
    age integer,
    gender text,
    weight double precision,
    height double precision,
    phone text,
    allergies text,
    ailments text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "scribeNotes" text
);


ALTER TABLE public."PatientProfile" OWNER TO aarogya;

--
-- Name: User; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO aarogya;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: aarogya
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO aarogya;

--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."Appointment" (id, "patientId", "doctorId", "scheduledAt", reason, status, notes, "createdAt", "updatedAt", "AI-Notes", prescription, "prescriptionPdf", "recommendedTests") FROM stdin;
cmg5ceo0o0001itpg1llk5gag	cmg590psu0000itsm4ft4smod	cmg59ygq10007itsm95wp0kbe	2025-10-02 06:30:00	Difficulty in Breathing	COMPLETED	\N	2025-09-29 16:28:18.072	2025-09-29 17:43:11.035	\N	\N	\N	\N
cmg5f8djn0003itpg31zjbhde	cmg590psu0000itsm4ft4smod	cmg59ygq10007itsm95wp0kbe	2025-09-30 06:30:00	Pain in the chest	ACCEPTED	\N	2025-09-29 17:47:23.411	2025-10-04 02:36:18.219	## 1. CHIEF COMPLAINT\n• Primary reason for visit: High fever, severe headache, and body aches.\n\n## 2. HISTORY OF PRESENT ILLNESS\n• Current symptoms: High fever (over 102°F), severe headache behind the eyes, intense muscle and joint pain, nausea, loss of appetite, and small, red, splotchy spots on the arms and chest.\n• Duration: Symptoms started 3 days ago.\n• Severity: Symptoms are severe, with the patient feeling "absolutely terrible."\n• Associated symptoms or triggers: Mosquitoes in the patient's area, recent rains, and a neighbour's daughter having a similar high fever last week.\n\n## 3. PAST MEDICAL HISTORY\n• Not mentioned\n\n## 4. MEDICATIONS\n• Current medications: None mentioned\n• New medications prescribed by doctor:\n  • Paracetamol for fever management\n  • Oral rehydration solutions for hydration\n  • Fresh juices and coconut water for hydration\n  • Complete rest and avoidance of other pain medicines like Ibuprofen or Aspirin\n\n## 5. PHYSICAL EXAMINATION FINDINGS\n• Not mentioned\n\n## 6. ASSESSMENT AND PLAN\n• Doctor's clinical impressions or diagnoses: Suspected dengue fever\n• Treatment recommendations and instructions:\n  • Get a blood test done immediately to confirm the diagnosis and check for the dengue virus and platelet count\n  • Hydration management: drink plenty of fluids, including water, coconut water, fresh juices, and oral rehydration solutions\n  • Complete rest\n  • Take Paracetamol for fever management, but avoid other pain medicines like Ibuprofen or Aspirin\n  • Monitor for warning signs: severe abdominal pain, persistent vomiting, bleeding from the nose or gums, extreme lethargy or restlessness\n  • Go to a hospital emergency room immediately if any of the warning signs appear\n\n## 7. PATIENT EDUCATION\n• Lifestyle modifications or precautions discussed:\n  • Avoid other pain medicines like Ibuprofen or Aspirin\n  • Monitor for warning signs and go to a hospital emergency room immediately if any appear\n  • Prioritize hydration and complete rest\n\n## 8. SUMMARY\n• The patient presented with high fever, severe headache, and body aches, which are characteristic of dengue fever. The doctor suspects dengue fever and has recommended a blood test to confirm the diagnosis. The patient is advised to prioritize hydration, complete rest, and avoid other pain medicines like Ibuprofen or Aspirin. The patient is also instructed to monitor for warning signs and go to a hospital emergency room immediately if any appear.	\N	\N	\N
\.


--
-- Data for Name: AppointmentTranscription; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."AppointmentTranscription" (id, "appointmentId", text, "createdAt") FROM stdin;
cmg85jc3i0007itqmv8bsqo5z	cmg5f8djn0003itpg31zjbhde	"Good morning, come in, please have a seat. You look like you're feeling quite unwell. What's been happening?"  "Thank you, doctor. I feel absolutely terrible. It started about three days ago with a very high fever, and I have this pounding headache that won't go away."  "I see. Can you tell me more about the headache? Where do you feel it most?"  "It’s a strange, intense pain right behind my eyes. And it's not just the headache; my entire body aches. My back, my joints... everything hurts. It honestly feels like my bones are aching."  "That sounds very uncomfortable. How high has the fever been? And have you experienced any other symptoms, like nausea or perhaps a rash?"  "The fever has been consistently high, over 102°F. I've felt very nauseous, with no appetite at all. And this morning, I noticed some small, red, splotchy spots on my arms and chest."  "Okay. And I have to ask, given the season and the recent rains, have you noticed a lot of mosquitoes where you live? Is anyone else in your home or neighbourhood unwell?"  "The mosquitoes have been awful, yes. And my neighbour was telling me their daughter had a very similar high fever last week."  "Right. Thank you. Your symptoms—the high fever, severe headache behind the eyes, the intense muscle and joint pain, which is often called 'breakbone fever'—are very characteristic of a viral illness common at this time of year. I strongly suspect you have dengue fever."  "I was afraid of that. What should I do?"  "First, we need to confirm it. I'm giving you a form to get a blood test done immediately. We need to check for the dengue virus and also get a platelet count. For now, treatment is focused on managing the symptoms, as there's no specific cure."  "So no antibiotics?"  "No, antibiotics don't work on viruses. The most critical thing for you is hydration. You must drink plenty of fluids—water, coconut water, fresh juices, oral rehydration solutions. Dehydration is what makes dengue dangerous. The second is complete rest."  "What about the fever and the pain? Can I take a painkiller?"  "You can take Paracetamol for the fever. It is very important that you **do not** take any other pain medicine like Ibuprofen or Aspirin. Those can increase the risk of complications like bleeding."  "Okay, only Paracetamol. I'll remember that."  "Good. Now, you also need to be aware of the warning signs. These can appear even as the fever starts to go down. If you develop severe abdominal pain, start vomiting repeatedly, notice any bleeding from your nose or gums, or feel extremely lethargic or restless, you need to go to a hospital emergency room immediately. Do you understand?"  "Yes, doctor. Severe stomach pain, persistent vomiting, or any bleeding means go straight to the hospital."  "Exactly. For now, go get the blood test, then go straight home to bed. Rest and push the fluids. Please call me as soon as you have the blood report. We need to monitor your platelet count closely over the next few days."  "I will. Thank you so much, doctor."	2025-10-01 15:39:17.118
\.


--
-- Data for Name: ChatHistory; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."ChatHistory" (id, "patientId", message, "isUser", "createdAt") FROM stdin;
chat_20251004_083202_3866	cmg590psu0000itsm4ft4smod	Tell me about the last appointment	t	2025-10-04 08:32:02.041
chat_20251004_083203_828	cmg590psu0000itsm4ft4smod	**Last Appointment Summary**\n\nBased on the documented medical information, the last appointment was on **2025-09-30T06:30:00** with **Doctor Jane Smith** from the **Department of Medicine**.\n\n**Reason for Visit**: The primary reason for the visit was **High fever, severe headache, and body aches**.\n\n**Current Symptoms**: The patient reported experiencing **high fever (over 102°F)**, **severe headache behind the eyes**, **intense muscle and joint pain**, **nausea**, **loss of appetite**, and **small, red, splotchy spots on the skin**.\n\n**AI Consultation Summary**: The AI consultation summary provided additional details on the patient's symptoms and medical history.\n\n**Recommendations**: Based on the documented medical information, it is essential to continue monitoring the patient's symptoms and seek further medical attention if necessary.\n\n**Actionable Next Steps**:\n\n1. **Schedule a follow-up appointment**: The patient should schedule a follow-up appointment with Doctor Jane Smith to reassess their symptoms and receive further guidance.\n2. **Continue monitoring symptoms**: The patient should continue to monitor their symptoms and report any changes or worsening of their condition to their doctor.\n3. **Stay hydrated and rest**: The patient should prioritize staying hydrated and getting plenty of rest to help their body recover from the illness.\n\n**Safety Concerns**: The patient's symptoms, particularly the high fever and severe headache, may indicate a potential infection. It is essential to monitor their condition closely and seek medical attention if their symptoms worsen or do not improve with time.\n\n**Empathy and Support**: I understand that the patient is experiencing a difficult time with their symptoms, and I encourage them to prioritize their health and seek further medical attention if necessary.\n\n⚠️ *This information is for general guidance only and should not replace professional medical advice. Please consult with your healthcare provider for personalized medical care.*	f	2025-10-04 08:32:03.374
\.


--
-- Data for Name: DoctorProfile; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."DoctorProfile" (id, "userId", name, age, phone, department, speciality, "createdAt", "updatedAt", signature, "signatureType", "clinicAddress", "clinicName", "clinicPhone") FROM stdin;
cmg59ygq50009itsm6r3vze6o	cmg59ygq10007itsm95wp0kbe	Jane Smith	45	1234567890	A	Medicine	2025-09-29 15:19:42.893	2025-09-29 15:23:49.367	\N	\N	\N	\N	\N
\.


--
-- Data for Name: MedicalTests; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."MedicalTests" ("TestID", "TestName") FROM stdin;
99029fa9-7b76-43e6-914b-7fa353fe18fd	Complete Blood Count (CBC)
4cff75dd-b964-4455-a6dd-588e7a1d0667	Basic Metabolic Panel (BMP)
c5300620-3bb8-48a3-a444-683dc3a1e977	Comprehensive Metabolic Panel (CMP)
93b9b9f6-ba14-4051-8cd8-2b6f49a7aef6	Lipid Panel
4d22c254-52d0-4cbe-ac28-c06a7a228ac1	Thyroid Stimulating Hormone (TSH)
5c99089c-72f5-4e94-935e-bf9103c790fe	Hemoglobin A1C
70d42f3a-f87f-42e8-aeef-6ff1e47f0f6d	Vitamin D
0c67d299-3cee-441b-b5c7-33f332175cd0	Vitamin B12
b6d49d49-dd46-4047-bd81-a0f16e083e9d	Folate (Folic Acid)
33370b7e-9425-48ff-94ef-aae58166fb45	Iron Studies
9256ea45-8fec-4924-9162-3615dbe24b8e	C-Reactive Protein (CRP)
ba0ea96b-bd18-4559-ae83-d4de237d5365	Erythrocyte Sedimentation Rate (ESR)
e80f934a-1ecd-43a9-9179-4ea48c17331e	Prothrombin Time (PT)
d10af8db-d758-4b64-9017-b49e0a9c1b5a	Partial Thromboplastin Time (PTT)
75607014-b3fd-4249-9a5d-a936dc171876	International Normalized Ratio (INR)
b9f3a1bd-896b-4404-8780-6705ce7ac16b	D-Dimer
a5567e54-8067-4e19-b921-cbb9ad90fd86	BNP (Brain Natriuretic Peptide)
7f9c9a4d-d4c9-4cc2-87ff-53d9c77fdc67	Troponin
b82167c3-5368-47aa-b9ce-5e9d6996576f	Creatine Kinase (CK)
b0a256f9-e8b1-492d-82da-609b968278c5	Lactate Dehydrogenase (LDH)
91ca7566-2bb1-46b4-aac2-8b6f81506df5	Alkaline Phosphatase
d08f8f70-a87d-4e5f-8d99-99a12bdb7b20	Gamma-Glutamyl Transferase (GGT)
ba4e400b-9794-481a-917a-7c412f05e50a	Total Protein
ddd27372-e68f-4261-bf1b-7154c57738c1	Albumin
2b2482ae-de18-43fb-9d6a-9f4f4d742a2b	Globulin
456d08f7-6d9b-48fe-9c31-cf43135596f2	Uric Acid
cbe34a2d-f011-4882-8499-5121702adc2d	Magnesium
30b7d2f2-7882-4bdf-a29a-0255412bdc22	Phosphorus
2ae5c994-562b-424c-8372-c88f533935d0	Lactate
1231474a-68c5-486e-8be7-1732637ddb85	Ammonia
36de1753-36a1-4cbc-bb46-e6283ea651c1	Urinalysis
6c96a26c-4209-4343-974a-64c366ea0fc1	Urine Culture
441b8548-e170-4eb8-95f5-5abeab5c69f3	Microalbumin
f692076c-2871-47c0-834d-f23a4ec52d42	24-Hour Urine Protein
90709b4c-70a8-4f84-8ffb-a9b2b7f1a807	24-Hour Urine Creatinine
dd7652f5-7edc-40ba-9f70-48c468e6ee7d	Urine Protein/Creatinine Ratio
ddb4245d-9bd6-47d6-8999-b734673a7c40	Urine Ketones
c25f471b-30df-4e3f-8632-bf4d0f6b25c1	Urine Glucose
febddced-5f01-4a1b-a381-36138ac5a45c	Urine pH
9061cc9a-8ac2-4fbd-b9c5-75780e07166f	Urine Specific Gravity
93520094-5c0b-4061-9f36-6c8618f610f6	Chest X-Ray
ac202465-762f-40f2-9b7c-964fa36e5004	Abdominal X-Ray
90135ff9-d273-45cf-9e1d-32b2272dceb0	Pelvic X-Ray
d160877c-b566-48f2-88c5-34813798af8d	Spine X-Ray
024ac3e7-a4fd-420a-86e0-fc09ad247883	Knee X-Ray
4a11cdcf-33ae-4858-8a19-71ec133ef231	Ankle X-Ray
7eeb24ff-13c2-4115-b5a9-97a155c86163	Wrist X-Ray
b4a6d54d-3dc8-420e-b0af-3f0386caaf0f	Elbow X-Ray
1e535e86-77cc-4f5a-b678-83f2a9c4926f	Shoulder X-Ray
4e8c6062-c61d-4846-a1f9-e16ab6c7167a	CT Scan - Head
672ff8e0-3d2c-480e-8107-6edb8f56d560	CT Scan - Chest
7e41a00f-3eeb-4196-ac33-5e4bc4a96782	CT Scan - Abdomen
95798d21-0505-40cf-ac2d-6fb3f0ef6446	CT Scan - Pelvis
06ae3973-d6d1-4da0-9248-5d47906f4412	MRI - Brain
dba69957-00cf-4aad-a43c-e1649dc76281	MRI - Spine
fb0e706c-c41a-4679-bb80-81afb2c7b90c	MRI - Knee
1d6f702e-33c6-404c-ad9f-08615b9d3ab2	MRI - Shoulder
d1193320-7ef9-4bbe-a58c-aafc6b950de0	Ultrasound - Abdominal
16f3d288-06bd-4bb5-ac08-8621dc9376eb	Ultrasound - Pelvic
509f9661-bb1b-4efb-82cb-1bca6f3293b3	Ultrasound - Thyroid
14f3b5f1-abd1-4c75-beb2-a5068380e62c	Ultrasound - Heart (Echocardiogram)
66b891d5-a885-4927-9b1e-7415b8f75e1a	Mammography
0bfda857-0c58-43b2-bfa0-c93bbc8a3c91	Bone Density Scan (DEXA)
ce1931d5-c0f1-4e0e-bec9-f4c75a5890cb	Nuclear Medicine Scan
66f51d4b-cdd5-4a09-b15c-5fac937fb5a0	Electrocardiogram (EKG/ECG)
b315ff0d-8c58-42f5-8f38-03e000e63856	Stress Test (Exercise)
206c31b9-ba83-4ffa-b8ea-e99945a0234f	Stress Test (Pharmacological)
d3ee7750-53c7-4335-88a0-d4357c005549	Holter Monitor
844abedf-2c8b-4eb2-b289-defd1c038e0d	Event Monitor
85509aaa-ad64-4580-8204-d2f8d70d3d97	Echocardiogram (2D)
9eeb11e4-a92a-4452-95f6-1154ab7c9b8f	Echocardiogram (Doppler)
8fff0350-f58a-48d4-b484-5f98d21baf02	Transesophageal Echocardiogram
403d91ca-0fb8-48f1-8e3a-4bb4cb2be16e	Cardiac Catheterization
282eb10c-1b05-464f-ba9a-22c7938ce7d2	Coronary Angiography
4347fdf7-9681-4cf5-a5a8-0878daf92b07	Spirometry
ab42e449-0d95-40ef-990b-47660886ea49	Pulmonary Function Test
f82969bc-00ee-4ced-a122-2c9e54b3465c	Arterial Blood Gas (ABG)
004780dd-2d49-4d6e-85af-b2187ffa8bbb	Peak Flow
57ed944d-1af1-456c-b71b-0a9434e6c742	Bronchoscopy
d74159b4-e35f-44bc-8d22-6cd897973ea2	Sleep Study (Polysomnography)
0ed1d0ed-7ba2-4127-8577-0498af955186	Oximetry
e3026ad6-fe97-4e42-a721-2a7e1df119af	Methacholine Challenge
ccea961d-ae52-4c46-8ed7-01ea6ed87a26	Colonoscopy
72eb2632-09f0-41b8-af4d-9c02d29bfd19	Upper Endoscopy (EGD)
b30f5946-0a22-4cda-9814-3b18436e5204	Sigmoidoscopy
b10f69c1-bb4b-42c4-b508-c0ca2b0a7b81	Capsule Endoscopy
54f8842d-aa11-42b2-bccc-46a7c7b2e652	ERCP
0d1d1278-8758-4181-a03e-eee9f5e0e99d	Esophageal Manometry
b8cb499f-7f6b-4cb4-8010-b03321b6b70a	pH Monitoring
dbcb28d2-987e-4cd1-8d58-e127bc9372e1	Breath Test (H. pylori)
4cb56d9d-7d27-4e6e-93e1-89b4aaac9856	Stool Culture
e4e29516-ef9e-4b00-9167-034fc38e99b1	Stool Occult Blood
41f64923-c3c2-4e88-b862-fd5eb348ac67	Glucose Tolerance Test
8a4bf2b3-e695-4a88-8797-a73a1b8d1330	Insulin Level
0abcc42e-7d9b-47c8-85b8-164b685a595b	C-Peptide
234cb626-b480-4b19-9de2-2c7a076a7fc6	Cortisol
1953cfda-8e65-4910-803d-b78e3f7e0ff0	ACTH
33f736ce-f06e-4b50-b6a9-a5039687c775	Growth Hormone
f7bf6f26-bcb8-491d-a58b-4101bcf70390	IGF-1
3d544826-d4d4-4bc7-a82c-206cf3144fe3	Prolactin
e400e052-f719-4914-9b97-782f4bac7e82	Testosterone
cc86d33c-4c86-4fd2-8ec2-01c747504a07	Estradiol
b906bacc-0f13-4aa0-8a0f-c2c5d9860532	Progesterone
8475206c-f03f-4564-a14a-7205478adb64	FSH
70bc52fd-9677-4dde-a9b6-c7b84dad427f	LH
1aa55afa-00a8-4903-8198-2a15ef499713	Parathyroid Hormone (PTH)
774c03f5-fc85-49d0-8861-2563e92910c5	Calcitonin
024ec984-18bf-4bd0-a0f6-228620781ecf	HIV Test
4c776b8a-f35f-4087-9a4e-f45b55caf2ae	Hepatitis B Surface Antigen
53d2500d-1c74-4543-8ced-acaf423ffc45	Hepatitis C Antibody
425fcb08-9a5f-4eba-b641-002228e9d1f0	Syphilis Test (RPR)
f28df7e6-0d50-42ea-b3d6-d745b2f414bd	Chlamydia Test
e6f7d3d6-f9aa-45df-9ac2-6196fe3d68c3	Gonorrhea Test
25030209-dbf9-4586-b6a7-6ff0d2804ad8	Mononucleosis Test
7834762f-b953-40db-8c87-c60cbd1f342a	Lyme Disease Test
30df7723-683c-4d81-967b-cf53224ef01a	Tuberculosis Test (PPD)
e10f02aa-d78e-459c-891d-acad1bbdfe6c	Blood Culture
e338e197-de04-4632-ba08-b337e763baec	Allergy Skin Test
08d939e1-d507-4755-88b3-94adcdb6e333	RAST Test
ca9b905a-0a3e-40f7-b643-0fe44be86b17	Food Allergy Panel
e64f6bbe-144c-4ce9-9ae0-95006156037d	Environmental Allergy Panel
d57c3e9c-897d-423d-89c5-893b5e54497a	Patch Test
b0063683-d8de-45c0-bfcf-3901265c998f	Electroencephalogram (EEG)
eda68cd3-e068-4009-a028-71078644dada	Electromyography (EMG)
9c0b5fd3-028b-4f7c-9eb5-17acf2638fd4	Nerve Conduction Study
c1e48864-40ee-41c5-9f4e-c5b730c75150	Lumbar Puncture
70af0a32-1c58-4add-b1d9-86ae4db83b8d	Evoked Potentials
bf5dcaa3-d030-47fd-8ee2-7cc19e3aab11	Skin Biopsy
d30b9fa8-cbcd-40ef-a057-dbf68e8ad385	Fungal Culture
98bb2c29-5cff-483d-acdf-bb394bab62a8	Scraping for Scabies
11b036f8-45ff-4054-a3e1-9c937f40f5c7	Wood's Lamp Examination
a67107f5-0bb3-4e13-9e3b-da35081024bb	Visual Field Test
b8b4cffc-9d79-4b1f-9985-7cac2a61dad3	Tonometry
7fd12d20-a29d-4c6c-a7e6-ad90166e9fcf	Fundus Photography
d129bfb9-7324-47bc-a1e6-bf5e30b35dde	Fluorescein Angiography
0b7d4570-7b31-4d5a-951f-61240428fd8d	Optical Coherence Tomography (OCT)
57d41423-8a4b-462e-9d1b-8cd6712b5877	PSA (Prostate Specific Antigen)
dabfa7fa-2f56-4c71-86b6-24d65b5b2029	Cystoscopy
7d9f03f4-043d-4991-8eda-5c6be1684334	Urodynamic Testing
d0ff853c-9349-4125-a494-fd1e9a046ca3	Kidney Stone Analysis
95c2be1a-ce26-4b4c-bcb7-7de56cfb2042	Semen Analysis
7543fc6f-74b3-4ec5-b6fa-65d8abeb381d	Pap Smear
71a77b2d-27e5-46ae-9c7e-ca7c923aceb9	HPV Test
9e6f122e-80c8-46bb-a652-311942bdc3e4	Pelvic Ultrasound
cc5f17f4-f5e9-4e52-a9b0-0958f24b30e9	Mammogram
ed9c040c-6ed9-4f45-a9da-792049ca5839	Bone Density Scan
a3753a05-f7f6-425f-8d6d-20f9a4fe17fa	Joint Aspiration
cf237939-796a-4b59-9eb7-b7b0e4400306	Bone Scan
740eb01d-c122-4742-8532-8a189e72bf4a	Arthroscopy
eaa77931-dc4c-4d7d-b962-96510508fd93	Electromyography
7eb677d1-9531-43a3-9c3c-b741e959c28d	Rheumatoid Factor
3c373750-f741-4491-9636-8faad6338bc5	Anti-CCP
43ba8f1f-16d9-4545-9a80-347349928ae8	ANA (Antinuclear Antibody)
1bcaac5c-1690-4359-94bb-ae12240a434a	ESR
3639a33e-2786-4b64-aa04-a81c24ef8bfa	CRP
b08dfa49-8dd6-4024-92fe-0dac55fcc43a	Complement C3/C4
f40b4127-2791-42b4-9bff-873ac10837a0	CA 125
1126df70-a8bf-4a97-8cc7-95068c62cbd9	CA 19-9
57d4a8c5-691c-425e-98dd-5bfef5060bba	CEA
f905771c-edc4-48c1-835c-b2ecb96d1448	AFP
769d5ac6-1bd6-481d-bd73-a5fa4605acd6	PSA
ded9170d-ea4c-4405-9d6b-e87b6357ad96	Bone Marrow Biopsy
e715ab96-4bef-4473-b983-feb7a0ab3e94	Lymph Node Biopsy
579c888b-0780-4dac-9257-037ef83cb094	Creatinine Clearance
8b64ba6b-ead1-4f07-a620-2f4c9055fd4e	GFR (Glomerular Filtration Rate)
71e72c0c-6f34-49d5-8b96-0a00cd071a47	Microalbumin/Creatinine Ratio
21f6bf75-856c-4439-876b-fc5d006f2cd6	24-Hour Urine Collection
0748ec2a-062f-4ed7-9d47-0006931ee6ba	Renal Ultrasound
d6b992c4-94c3-4309-a87c-09a7e8383e67	Renal Biopsy
fdefaa0d-a244-4c0c-a7d9-f26e42b8701a	Fecal Occult Blood
6384fc6e-d974-4b1b-8d41-f00e65440b9f	Stool DNA Test
5fbcd5a8-867a-4568-910e-a3475c364b3d	Helicobacter Pylori Test
b295d3b2-07d6-4ab3-b7ce-28b238e9bb41	Lactose Intolerance Test
c5c87cac-ad8e-432f-85a4-b1ef3c13ae2b	Celiac Disease Test
45883342-17af-447c-835c-91a0cce9ff67	Inflammatory Bowel Disease Panel
327c9f86-0ed6-4e08-acb2-1970b4f71a30	Pancreatic Function Test
2c2c0ced-a59e-4bd7-940a-f22c1b5418c2	Gastric Emptying Study
22416b8e-6614-473a-932d-0212fda74192	Esophageal pH Monitoring
\.


--
-- Data for Name: PatientProfile; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."PatientProfile" (id, "userId", name, age, gender, weight, height, phone, allergies, ailments, "createdAt", "updatedAt", "scribeNotes") FROM stdin;
cmg590psx0002itsmju1o3mpe	cmg590psu0000itsm4ft4smod	John Smith	32	Male	68	179	1234567890	\N	\N	2025-09-29 14:53:28.354	2025-10-04 02:41:29.238	Has potential dengue
cmgca1rjs0005itsd9flcmzhv	cmgca1rjq0003itsd5s1um1wi	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-04 12:56:40.121	2025-10-04 12:56:40.121	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public."User" (id, username, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
cmg590psu0000itsm4ft4smod	john smith	h2061289203	patient	2025-09-29 14:53:28.35	2025-09-29 14:53:28.35
cmg59ygq10007itsm95wp0kbe	jane smith	h917087411	doctor	2025-09-29 15:19:42.889	2025-09-29 15:19:42.889
cmgca1rjq0003itsd5s1um1wi	saswat	h2061289203	patient	2025-10-04 12:56:40.118	2025-10-04 12:56:40.118
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: aarogya
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
28866cd2-0bb5-401e-9ee2-80313e99b712	e7a09d00fb170483e08fc94139c9f8cca27cd938bd8c971a2cf8039240595150	2025-09-29 13:44:29.505594+00	20250929134429_init	\N	\N	2025-09-29 13:44:29.502388+00	1
daa7882d-c3aa-4629-b27f-06591f086654	f6c8ebc53a3c6762583c9b65f7853a2eeabaf360b27b4ee916880d22b9cddbf6	2025-09-29 13:52:36.90167+00	20250929135236_add_profiles	\N	\N	2025-09-29 13:52:36.894739+00	1
e55c6f7e-7288-43f0-9995-89936f5fe030	5192315b01c5e6d6e32c1cacbae26cf38c2e48b9ffe3bd11b623f09d2be41863	2025-09-29 16:19:29.965479+00	20250929161929_add_appointments	\N	\N	2025-09-29 16:19:29.960129+00	1
8274a401-be8c-42ab-89ed-792d4831ea04	15bcb1ed4c9ebb6a352942e2b4f952a87d981005d9b46c416c5857e329911f6e	2025-09-29 17:50:49.357054+00	20250929175049_add_scribe_notes	\N	\N	2025-09-29 17:50:49.355727+00	1
62b71cb7-84ea-40b7-9ada-ab3d4ded8307	c6f1b555edac1e515d7dfef70a744c34343e10303865ff33773624768e2e73b8	2025-09-29 20:40:27.682249+00	20250929204027_add_transcriptions_array	\N	\N	2025-09-29 20:40:27.680755+00	1
30f18bd8-c193-4098-8dd0-30a0d66a18e6	b758a875b7659ca0e0e6eb53eb92ffce1fe9afb1faac7a2884753f52610edf73	2025-09-29 20:44:52.97187+00	20250929204452_add_appointment_transcriptions	\N	\N	2025-09-29 20:44:52.96768+00	1
bcf0f70c-5fde-4d53-84e3-fffccf46114c	6dd60ff8a4ee6c29b8a029296f72c34c7e35fa8edd1a1a887cb5e8545a62c9e5	2025-10-02 12:33:52.614901+00	20251002123352_add_ai_notes	\N	\N	2025-10-02 12:33:52.611393+00	1
0d5d669e-9738-43ad-a316-88c6f41559e1	f5b0df6138ee0ccab65d3815fcf006d7b9d9ffd8f239e3e3a00c08a977231db4	2025-10-02 13:54:56.072422+00	20251002135456_map_ai_notes_column	\N	\N	2025-10-02 13:54:56.064102+00	1
f90bc118-83a6-40d0-a80e-2ae94f8c3cec	764757abf3a8d506da94b938e2446c38be022c72080a8f460d16c49f05bcfc1d	2025-10-03 00:19:59.708297+00	20251003001959_add_prescription_fields	\N	\N	2025-10-03 00:19:59.703403+00	1
95a3f29a-dfb1-45fe-a3f1-ba8c4d265c86	d992dd17015d835f027c40d3756ae0cf4ab49d9a4b896d8d4e6458223a4c10a1	2025-10-03 00:25:39.472244+00	20251003002539_add_doctor_signature_fields	\N	\N	2025-10-03 00:25:39.470464+00	1
ee31b098-fe79-47f0-be49-a6b0cf0c2aff	2bec9e966fd5c7f8dd64b15f7de827085bcb4cb1c47159df54cb18641ab0c051	2025-10-03 01:27:00.37719+00	20251003012700_add_medical_tests	\N	\N	2025-10-03 01:27:00.371133+00	1
687bc0ad-b99b-4b8e-8d95-4bb1b79327ca	112eea5890593caf037f23f5fdce7fedcb4a3078c2669386dd99126cb64d1dbf	2025-10-03 02:05:08.11012+00	20251003020508_create_simple_medical_tests	\N	\N	2025-10-03 02:05:08.103821+00	1
e2cc5404-9330-4275-b8e5-685372156ef7	40343487df18bdfedd8e7dc6de0ce2b1198ce0de672a696bd0f03b0b9b2049b1	2025-10-04 03:01:06.997469+00	20251004120000_add_chat_history	\N	\N	2025-10-04 03:01:06.991542+00	1
\.


--
-- Name: AppointmentTranscription AppointmentTranscription_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."AppointmentTranscription"
    ADD CONSTRAINT "AppointmentTranscription_pkey" PRIMARY KEY (id);


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: ChatHistory ChatHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."ChatHistory"
    ADD CONSTRAINT "ChatHistory_pkey" PRIMARY KEY (id);


--
-- Name: DoctorProfile DoctorProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."DoctorProfile"
    ADD CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY (id);


--
-- Name: MedicalTests MedicalTests_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."MedicalTests"
    ADD CONSTRAINT "MedicalTests_pkey" PRIMARY KEY ("TestID");


--
-- Name: PatientProfile PatientProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."PatientProfile"
    ADD CONSTRAINT "PatientProfile_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ChatHistory_patientId_createdAt_idx; Type: INDEX; Schema: public; Owner: aarogya
--

CREATE INDEX "ChatHistory_patientId_createdAt_idx" ON public."ChatHistory" USING btree ("patientId", "createdAt");


--
-- Name: DoctorProfile_userId_key; Type: INDEX; Schema: public; Owner: aarogya
--

CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON public."DoctorProfile" USING btree ("userId");


--
-- Name: MedicalTests_TestName_key; Type: INDEX; Schema: public; Owner: aarogya
--

CREATE UNIQUE INDEX "MedicalTests_TestName_key" ON public."MedicalTests" USING btree ("TestName");


--
-- Name: PatientProfile_userId_key; Type: INDEX; Schema: public; Owner: aarogya
--

CREATE UNIQUE INDEX "PatientProfile_userId_key" ON public."PatientProfile" USING btree ("userId");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: aarogya
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: AppointmentTranscription AppointmentTranscription_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."AppointmentTranscription"
    ADD CONSTRAINT "AppointmentTranscription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Appointment Appointment_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Appointment Appointment_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatHistory ChatHistory_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."ChatHistory"
    ADD CONSTRAINT "ChatHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorProfile DoctorProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."DoctorProfile"
    ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PatientProfile PatientProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aarogya
--

ALTER TABLE ONLY public."PatientProfile"
    ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict HFU4q80kwTQasYwCagR9QcbC2n3iZZKNHyOgY6kX4GRuVhcfjCEJYG6Zru9LW04

