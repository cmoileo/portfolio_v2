import os
import sys

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public")

PAPER = HexColor("#FAFAFA")
INK = HexColor("#111111")
MUTED = HexColor("#5A5A5A")
RULE = HexColor("#111111")
ACCENT = HexColor("#C8060F")

PAGE_MARGIN_X = 15 * mm
PAGE_MARGIN_TOP = 12 * mm
PAGE_MARGIN_BOTTOM = 10 * mm


def register_fonts():
    faces = {
        "Ultra": ("Ultra", "Ultra-Regular.ttf"),
        "Mono": ("Geist_Mono", "GeistMono-400.ttf"),
        "Mono-Medium": ("Geist_Mono", "GeistMono-500.ttf"),
        "Mono-Bold": ("Geist_Mono", "GeistMono-600.ttf"),
    }
    for name, (folder, filename) in faces.items():
        pdfmetrics.registerFont(
            TTFont(name, os.path.join(ROOT, "fonts-src", folder, filename))
        )
    pdfmetrics.registerFontFamily(
        "Mono", normal="Mono", bold="Mono-Bold", italic="Mono"
    )


class HeaderRule(Flowable):
    def __init__(self, thickness=1.6, space_before=4, space_after=5):
        Flowable.__init__(self)
        self.thickness = thickness
        self.space_before = space_before
        self.space_after = space_after

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        return avail_width, self.thickness + self.space_before + self.space_after

    def draw(self):
        c = self.canv
        y = self.space_after + self.thickness / 2.0
        c.setStrokeColor(INK)
        c.setLineWidth(self.thickness)
        c.line(0, y, self.width, y)


class SectionRule(Flowable):
    def __init__(self, accent_width=26, space_after=4):
        Flowable.__init__(self)
        self.accent_width = accent_width
        self.space_after = space_after

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        return avail_width, 1.4 + self.space_after

    def draw(self):
        c = self.canv
        y = self.space_after
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(0, y, self.width, y)
        c.setStrokeColor(ACCENT)
        c.setLineWidth(1.4)
        c.line(0, y, self.accent_width, y)


STYLES = {}


def build_styles():
    STYLES["name"] = ParagraphStyle(
        "name",
        fontName="Ultra",
        fontSize=21,
        leading=22,
        textColor=INK,
        spaceAfter=3,
        alignment=TA_LEFT,
    )
    STYLES["headline"] = ParagraphStyle(
        "headline",
        fontName="Mono-Bold",
        fontSize=8.6,
        leading=11,
        textColor=ACCENT,
        spaceAfter=4,
    )
    STYLES["contact"] = ParagraphStyle(
        "contact",
        fontName="Mono",
        fontSize=7.4,
        leading=10,
        textColor=MUTED,
    )
    STYLES["section"] = ParagraphStyle(
        "section",
        fontName="Mono-Bold",
        fontSize=8.4,
        leading=10.4,
        textColor=INK,
        spaceBefore=0,
        spaceAfter=2,
    )
    STYLES["entry"] = ParagraphStyle(
        "entry",
        fontName="Mono-Bold",
        fontSize=8.2,
        leading=10.6,
        textColor=INK,
        spaceAfter=0,
    )
    STYLES["meta"] = ParagraphStyle(
        "meta",
        fontName="Mono",
        fontSize=7.2,
        leading=9.6,
        textColor=MUTED,
        spaceAfter=1.5,
    )
    STYLES["body"] = ParagraphStyle(
        "body",
        fontName="Mono",
        fontSize=7.6,
        leading=10.0,
        textColor=INK,
        spaceAfter=2,
    )
    STYLES["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Mono",
        fontSize=7.6,
        leading=10.0,
        textColor=INK,
        leftIndent=11,
        bulletIndent=0,
        bulletFontName="Mono",
        bulletFontSize=7.6,
        bulletColor=ACCENT,
        spaceAfter=1.5,
    )


def section(title):
    return KeepTogether(
        [
            Spacer(1, 4),
            Paragraph(title, STYLES["section"]),
            SectionRule(),
        ]
    )


def entry(title, meta, bullets):
    flow = [Paragraph(title, STYLES["entry"]), Paragraph(meta, STYLES["meta"])]
    flow += [Paragraph(b, STYLES["bullet"], bulletText="\u2014") for b in bullets]
    flow.append(Spacer(1, 3))
    return KeepTogether(flow)


def skills_block(rows):
    flow = []
    for label, value in rows:
        flow.append(
            Paragraph(
                '<font name="Mono-Bold" color="#111111">%s</font>&nbsp;&nbsp;%s'
                % (label.upper(), value),
                STYLES["body"],
            )
        )
    return flow


def header(data):
    flow = [
        Paragraph(data["name"], STYLES["name"]),
        Paragraph(data["headline"].upper(), STYLES["headline"]),
    ]
    for line in data["contact"]:
        flow.append(Paragraph(line, STYLES["contact"]))
    flow.append(HeaderRule())
    return flow


def paint_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], stroke=0, fill=1)
    canvas.restoreState()


def build(data, path):
    doc = SimpleDocTemplate(
        path,
        pagesize=A4,
        leftMargin=PAGE_MARGIN_X,
        rightMargin=PAGE_MARGIN_X,
        topMargin=PAGE_MARGIN_TOP,
        bottomMargin=PAGE_MARGIN_BOTTOM,
        title=data["title"],
        author=data["name"],
        subject=data["subject"],
        keywords=data["keywords"],
        creator="Leo Fezard",
    )

    story = []
    story += header(data)

    story.append(section(data["labels"]["summary"]))
    story.append(Paragraph(data["summary"], STYLES["body"]))

    story.append(section(data["labels"]["skills"]))
    story += skills_block(data["skills"])

    story.append(section(data["labels"]["experience"]))
    for item in data["experience"]:
        story.append(entry(item["title"], item["meta"], item["bullets"]))

    story.append(section(data["labels"]["projects"]))
    for item in data["projects"]:
        story.append(entry(item["title"], item["meta"], item["bullets"]))

    story.append(section(data["labels"]["education"]))
    for item in data["education"]:
        story.append(entry(item["title"], item["meta"], item["bullets"]))

    story.append(section(data["labels"]["languages"]))
    for line in data["languages"]:
        story.append(Paragraph(line, STYLES["body"]))

    doc.build(story, onFirstPage=paint_page, onLaterPages=paint_page)


EN = {
    "title": "Leo Fezard - Fullstack Software Engineer - Resume",
    "subject": "Resume of Leo Fezard, Fullstack Software Engineer",
    "keywords": (
        "fullstack developer, software engineer, TypeScript, JavaScript, PHP, Laravel, "
        "React, Next.js, Angular, Vue.js, NestJS, AdonisJS, Node.js, PostgreSQL, MySQL, "
        "Docker, CI/CD, GitHub Actions, REST API, SaaS, multi-tenant, AI agents, MCP, LLM, Paris"
    ),
    "name": "Léo Fezard",
    "headline": "Fullstack Software Engineer",
    "contact": [
        "Paris, France | +33 6 52 33 67 62 | leo.fezard33@gmail.com",
        "linkedin.com/in/leo-fezard | github.com/cmoileo | leo-fezard.dev",
    ],
    "labels": {
        "summary": "PROFESSIONAL SUMMARY",
        "skills": "SKILLS",
        "experience": "WORK EXPERIENCE",
        "projects": "PROJECTS",
        "education": "EDUCATION",
        "languages": "LANGUAGES",
    },
    "summary": (
        "Fullstack software engineer with 3+ years of experience shipping B2B SaaS and cross-platform "
        "products. Backend in PHP / Laravel and Node.js (NestJS, AdonisJS), frontend in TypeScript with "
        "React, Next.js, Angular and Vue.js. Hands-on with multi-tenant architecture, REST API design, "
        "automated testing, CI/CD and AI agent integration (MCP servers, LLM orchestration). Currently "
        "completing a Master's degree in Fullstack Development and Management in Paris."
    ),
    "skills": [
        ("Languages", "TypeScript, JavaScript, PHP, SQL, HTML, CSS, SCSS"),
        (
            "Frontend",
            "React, Next.js, Angular, Vue.js, Ionic, React Native (Expo), Tailwind CSS, GSAP",
        ),
        (
            "Backend",
            "Laravel, NestJS, AdonisJS, Node.js, REST APIs, PostgreSQL, MySQL, multi-tenant architecture",
        ),
        (
            "AI and Agents",
            "MCP servers, LLM orchestration, Ollama, Qwen 2.5, embeddings and vector search, Claude Code, OpenCode, edge AI",
        ),
        (
            "DevOps and Tooling",
            "Docker, CI/CD, GitHub Actions, Git, Railway, AWS S3",
        ),
        ("Testing", "PHPUnit, Vitest, Playwright, Maestro"),
        ("Tools and methods", "Figma, Photoshop, Agile / Scrum, code review, technical documentation"),
    ],
    "experience": [
        {
            "title": "Fullstack Developer - Thegreenshot",
            "meta": "Bordeaux, France (hybrid) | August 2024 - Present",
            "bullets": [
                "Develop Ooviiz, a B2B SaaS platform optimizing audiovisual production workflows, on a multi-tenant architecture.",
                "Build and maintain a PHP / Laravel backend serving Angular and Vue.js + Ionic client applications.",
                "Contribute to feature design and architecture decisions, automated tests and CI workflows.",
                "Prototype agentic pipelines: Laravel orchestration driving a Qwen 2.5 model served locally through Ollama.",
            ],
        },
        {
            "title": "Web Developer - Agence Thrive",
            "meta": "Bordeaux, France | April 2023 - August 2024",
            "bullets": [
                "Delivered showcase websites and customer portals for a wide range of clients using PHP, WordPress, JavaScript, SCSS and GSAP.",
                "Translated design files into responsive, accessible and animated interfaces, and handled deployments, maintenance and client support.",
            ],
        },
    ],
    "projects": [
        {
            "title": "Inkgora - Social reading network (inkgora.com)",
            "meta": "Personal product | Live on iOS, Android beta with 12 testers",
            "bullets": [
                "Designed and shipped a cross-platform product: Laravel REST API, Next.js web app and Expo mobile app.",
                "Set up a complete CI pipeline covering unit, integration and end-to-end testing with PHPUnit, Vitest, Playwright and Maestro.",
                "Implemented ZIP-bomb mitigation and Apple OAuth authentication; building an embeddings-based recommendation engine as a dedicated microservice.",
            ],
        },
        {
            "title": "Mobilistud - Student sub-letting platform (mobilistud.com)",
            "meta": "B2B SaaS | Incubated at EFREI",
            "bullets": [
                "Built automated bilateral contract generation, real-time messaging and an in-house KYC verification flow.",
                "Stack: React, AdonisJS, PostgreSQL and AWS S3.",
            ],
        },
    ],
    "education": [
        {
            "title": "Master's Degree, Fullstack Development and Management",
            "meta": "EFREI, Paris, France | 2024 - 2026",
            "bullets": [
                "Thesis: \"Rethinking SaaS in the age of agentic design\" - TypeScript MCP server proof of concept with Laravel orchestration.",
            ],
        },
        {
            "title": "Bachelor's Degree, Web Development",
            "meta": "École Supérieure du Digital, Bordeaux, France | 2021 - 2024",
            "bullets": [
                "Capstone project: a fullstack project-management platform built with React and NestJS.",
            ],
        },
    ],
    "languages": [
        "French - Native",
        "English - C1 (TOEIC 945)",
        "Spanish - A2 (elementary)",
    ],
}

FR = {
    "title": "Leo Fezard - Developpeur Fullstack - CV",
    "subject": "CV de Leo Fezard, developpeur fullstack",
    "keywords": (
        "developpeur fullstack, ingenieur logiciel, TypeScript, JavaScript, PHP, Laravel, "
        "React, Next.js, Angular, Vue.js, NestJS, AdonisJS, Node.js, PostgreSQL, MySQL, "
        "Docker, CI/CD, GitHub Actions, API REST, SaaS, multi-tenant, agents IA, MCP, LLM, Paris"
    ),
    "name": "Léo Fezard",
    "headline": "Développeur Fullstack",
    "contact": [
        "Paris, France | +33 6 52 33 67 62 | leo.fezard33@gmail.com",
        "linkedin.com/in/leo-fezard | github.com/cmoileo | leo-fezard.dev",
    ],
    "labels": {
        "summary": "PROFIL",
        "skills": "COMPÉTENCES",
        "experience": "EXPÉRIENCE PROFESSIONNELLE",
        "projects": "PROJETS",
        "education": "FORMATION",
        "languages": "LANGUES",
    },
    "summary": (
        "Développeur fullstack avec plus de 3 ans d'expérience dans la mise en production de SaaS B2B et "
        "de produits cross-platform. Backend en PHP / Laravel et Node.js (NestJS, AdonisJS), frontend en "
        "TypeScript avec React, Next.js, Angular et Vue.js. Expérimenté sur l'architecture multi-tenant, "
        "les API REST, les tests automatisés, la CI/CD et l'intégration d'agents IA (serveurs MCP, "
        "orchestration de LLM). Actuellement en Mastère Manager Développeur Fullstack à Paris."
    ),
    "skills": [
        ("Langages", "TypeScript, JavaScript, PHP, SQL, HTML, CSS, SCSS"),
        (
            "Frontend",
            "React, Next.js, Angular, Vue.js, Ionic, React Native (Expo), Tailwind CSS, GSAP",
        ),
        (
            "Backend",
            "Laravel, NestJS, AdonisJS, Node.js, API REST, PostgreSQL, MySQL, architecture multi-tenant",
        ),
        (
            "IA et agents",
            "Serveurs MCP, orchestration de LLM, Ollama, Qwen 2.5, embeddings et recherche vectorielle, Claude Code, OpenCode, edge AI",
        ),
        (
            "DevOps et outils",
            "Docker, CI/CD, GitHub Actions, Git, Railway, AWS S3",
        ),
        ("Tests", "PHPUnit, Vitest, Playwright, Maestro"),
        ("Outils et méthodes", "Figma, Photoshop, Agile / Scrum, revue de code, documentation technique"),
    ],
    "experience": [
        {
            "title": "Développeur Fullstack - Thegreenshot",
            "meta": "Bordeaux, France (hybride) | Août 2024 - Aujourd'hui",
            "bullets": [
                "Développement d'Ooviiz, SaaS B2B d'optimisation des productions audiovisuelles, sur une architecture multi-tenant.",
                "Conception et maintenance d'un backend PHP / Laravel alimentant des clients Angular et Vue.js + Ionic.",
                "Participation aux décisions d'architecture, aux tests automatisés et aux workflows CI.",
                "Prototypage de pipelines agentic : orchestration Laravel pilotant un modèle Qwen 2.5 servi localement via Ollama.",
            ],
        },
        {
            "title": "Développeur Web - Agence Thrive",
            "meta": "Bordeaux, France | Avril 2023 - Août 2024",
            "bullets": [
                "Réalisation de sites vitrines et d'espaces utilisateurs pour des clients variés en PHP, WordPress, JavaScript, SCSS et GSAP.",
                "Intégration de maquettes en interfaces responsives et animées, mises en ligne, maintenance et support client.",
            ],
        },
    ],
    "projects": [
        {
            "title": "Inkgora - Réseau social de lecture (inkgora.com)",
            "meta": "Produit personnel | Disponible sur iOS, bêta Android avec 12 testeurs",
            "bullets": [
                "Conception et mise en production d'un produit cross-platform : API REST Laravel, application web Next.js et application mobile Expo.",
                "Mise en place d'une CI complète couvrant tests unitaires, d'intégration et end-to-end avec PHPUnit, Vitest, Playwright et Maestro.",
                "Mitigation des ZIP-bombs, authentification Apple OAuth et moteur de recommandation par embeddings en microservice dédié.",
            ],
        },
        {
            "title": "Mobilistud - Plateforme de sous-location étudiante (mobilistud.com)",
            "meta": "SaaS B2B | Incubé à l'EFREI",
            "bullets": [
                "Génération automatique de contrats bilatéraux, messagerie temps réel et parcours KYC interne.",
                "Stack : React, AdonisJS, PostgreSQL et AWS S3.",
            ],
        },
    ],
    "education": [
        {
            "title": "Mastère Manager Développeur Fullstack (Bac+5)",
            "meta": "EFREI, Paris, France | 2024 - 2026",
            "bullets": [
                "Mémoire : « Penser les SaaS à l'ère de l'agentic design » - POC de serveur MCP en TypeScript avec orchestration Laravel.",
            ],
        },
        {
            "title": "Bachelor Développeur Web (Bac+3)",
            "meta": "École Supérieure du Digital, Bordeaux, France | 2021 - 2024",
            "bullets": [
                "Projet de fin d'études : plateforme de gestion de projet fullstack développée en React et NestJS.",
            ],
        },
    ],
    "languages": [
        "Français - Langue maternelle",
        "Anglais - C1 (TOEIC 945)",
        "Espagnol - A2 (élémentaire)",
    ],
}


def main():
    register_fonts()
    build_styles()
    build(EN, os.path.join(OUT_DIR, "cv.pdf"))
    build(FR, os.path.join(OUT_DIR, "cv-fr.pdf"))
    print("Generated public/cv.pdf and public/cv-fr.pdf")


if __name__ == "__main__":
    sys.exit(main())
