#!/usr/bin/env python3
"""
Generate competitive research report for ServiceNow EAP analysis.
Reads all JSON results + fields.yaml, outputs report.md.
"""

import json
import os
import glob
import re
import yaml

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")
FIELDS_YAML = os.path.join(os.path.dirname(__file__), "fields.yaml")
OUTLINE_YAML = os.path.join(os.path.dirname(__file__), "outline.yaml")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "report.md")

CATEGORY_LABELS = {
    "team_experience": "Team Experience",
    "developer_experience": "Developer Experience",
    "adoption": "Onboarding & Adoption",
    "framework": "Framework & Portfolio",
    "ecosystem": "Integrations & Ecosystem",
    "commercial": "Commercial",
    "market": "Market Position",
}

PRIORITY_ORDER = ["critical", "high", "medium", "low"]
INTERNAL_KEYS = {"uncertain", "id", "sources", "_source_file"}

# ── Helpers ────────────────────────────────────────────────────────────────────

def load_fields(path):
    with open(path) as f:
        data = yaml.safe_load(f)
    fields = data.get("fields", [])
    field_map = {}   # name → field def
    cat_map = {}     # category → [field_names]
    for field in fields:
        name = field["name"]
        cat = field.get("category", "other")
        field_map[name] = field
        cat_map.setdefault(cat, []).append(name)
    return field_map, cat_map

def load_outline_priorities(outline_path):
    """Build id→priority and name→priority maps from outline.yaml."""
    with open(outline_path) as f:
        data = yaml.safe_load(f)
    id_map = {}
    name_map = {}
    for item in data.get("items", []):
        p = item.get("priority", "medium")
        if item.get("id"):
            id_map[item["id"]] = p
        if item.get("name"):
            name_map[item["name"].lower()] = p
    return id_map, name_map

def load_results(results_dir):
    id_priorities, name_priorities = load_outline_priorities(OUTLINE_YAML)
    items = []
    for path in sorted(glob.glob(os.path.join(results_dir, "*.json"))):
        with open(path) as f:
            data = json.load(f)
        data["_source_file"] = os.path.basename(path)
        # Inject priority from outline if missing
        if not data.get("priority"):
            item_id = data.get("id", "")
            item_name = data.get("name", "").lower()
            data["priority"] = (
                id_priorities.get(item_id)
                or name_priorities.get(item_name)
                or "medium"
            )
        items.append(data)
    # Sort by priority then name
    def sort_key(item):
        p = item.get("priority", "medium")
        try:
            pi = PRIORITY_ORDER.index(p)
        except ValueError:
            pi = 99
        return (pi, item.get("name", ""))
    items.sort(key=sort_key)
    return items

def is_uncertain(value, name, uncertain_list):
    if name in uncertain_list:
        return True
    if value is None or value == "":
        return True
    if isinstance(value, str) and "[uncertain]" in value:
        return True
    return False

def anchor(name):
    """Convert name to GitHub-flavored markdown anchor."""
    slug = name.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug.strip())
    slug = re.sub(r"-+", "-", slug)
    return slug

def format_value(value):
    """Format a field value for markdown output."""
    if isinstance(value, list):
        if not value:
            return "_None_"
        if all(isinstance(v, dict) for v in value):
            lines = []
            for item in value:
                parts = [f"**{k}**: {v}" for k, v in item.items()]
                lines.append("- " + " | ".join(parts))
            return "\n".join(lines)
        if len(value) <= 5 and all(len(str(v)) < 60 for v in value):
            return ", ".join(str(v) for v in value)
        return "\n".join(f"- {v}" for v in value)
    if isinstance(value, dict):
        parts = []
        for k, v in value.items():
            parts.append(f"**{k}**: {v}")
        return "; ".join(parts)
    text = str(value).strip()
    return text

def priority_badge(p):
    badges = {
        "critical": "🔴 Critical",
        "high": "🟠 High",
        "medium": "🟡 Medium",
        "low": "🔵 Low",
    }
    return badges.get(p, p.title())

# ── Report builder ──────────────────────────────────────────────────────────────

def build_report(items, field_map, cat_map):
    lines = []

    # ── Title ──
    lines.append("# ServiceNow EAP — Competitive Analysis Report")
    lines.append("")
    lines.append("> **Research focus:** Why ServiceNow EAP is not a market leader and what it needs to become a full solution — with emphasis on team-member daily experience and execution gaps.")
    lines.append("> **Date:** 2026-05-20 | **Items researched:** 18 | **Fields per item:** 24")
    lines.append("")

    # ── Table of Contents ──
    lines.append("## Table of Contents")
    lines.append("")
    lines.append("| # | Tool | Priority |")
    lines.append("|---|------|----------|")
    for i, item in enumerate(items, 1):
        name = item.get("name", "Unknown")
        p = item.get("priority", "")
        badge = priority_badge(p)
        anc = anchor(name)
        lines.append(f"| {i} | [{name}](#{anc}) | {badge} |")
    lines.append("")

    # ── EAP Gap Summary (ServiceNow items first, as the subject) ──
    sn_items = [x for x in items if "servicenow" in x.get("id", "").lower()]
    if sn_items:
        lines.append("---")
        lines.append("")
        lines.append("## ServiceNow EAP — Consolidated Gap Analysis")
        lines.append("")
        lines.append("*What the research says EAP must build to become a full solution.*")
        lines.append("")
        for item in sn_items:
            uncertain_list = item.get("uncertain", [])
            name = item.get("name", "")
            must_build = item.get("what_eap_must_build", "")
            gaps = item.get("gaps_vs_market_leader", "")
            lines.append(f"### {name}")
            lines.append("")
            if must_build and not is_uncertain(must_build, "what_eap_must_build", uncertain_list):
                lines.append("**What EAP must build:**")
                lines.append("")
                lines.append(format_value(must_build))
                lines.append("")
            if gaps and not is_uncertain(gaps, "gaps_vs_market_leader", uncertain_list):
                lines.append("**Gaps vs. market leader:**")
                lines.append("")
                lines.append(format_value(gaps))
                lines.append("")
        lines.append("---")
        lines.append("")

    # ── Per-item detailed sections ──
    lines.append("## Detailed Tool Profiles")
    lines.append("")

    for item in items:
        name = item.get("name", "Unknown")
        p = item.get("priority", "")
        uncertain_list = item.get("uncertain", [])

        lines.append(f"---")
        lines.append("")
        lines.append(f"## {name}")
        lines.append("")
        lines.append(f"**Priority:** {priority_badge(p)}")
        lines.append("")

        # Description from outline (stored in JSON as 'description' if agent included it)
        desc = item.get("description", "")
        if desc and not is_uncertain(desc, "description", uncertain_list):
            lines.append(f"> {desc}")
            lines.append("")

        # Fields by category
        for cat_key, cat_label in CATEGORY_LABELS.items():
            cat_fields = cat_map.get(cat_key, [])
            # Collect non-uncertain fields for this category
            rendered = []
            for fname in cat_fields:
                val = item.get(fname)
                if is_uncertain(val, fname, uncertain_list):
                    continue
                field_def = field_map.get(fname, {})
                field_label = fname.replace("_", " ").title()
                rendered.append((field_label, format_value(val)))

            if not rendered:
                continue

            lines.append(f"### {cat_label}")
            lines.append("")
            for label, text in rendered:
                lines.append(f"**{label}**")
                lines.append("")
                # Long text: render as blockquote paragraphs
                if len(text) > 200:
                    for para in text.split("\n"):
                        para = para.strip()
                        if para:
                            lines.append(para)
                    lines.append("")
                else:
                    lines.append(text)
                    lines.append("")

        # Extra fields not in fields.yaml
        known_keys = set(field_map.keys()) | INTERNAL_KEYS | {"name", "description", "priority", "id"}
        extras = {k: v for k, v in item.items() if k not in known_keys and not is_uncertain(v, k, uncertain_list)}
        if extras:
            lines.append("### Other Information")
            lines.append("")
            for k, v in extras.items():
                label = k.replace("_", " ").title()
                lines.append(f"**{label}:** {format_value(v)}")
                lines.append("")

        # Sources
        sources = item.get("sources", [])
        if sources and not is_uncertain(sources, "sources", uncertain_list):
            lines.append("### Sources")
            lines.append("")
            if isinstance(sources, list):
                for s in sources:
                    if isinstance(s, str):
                        lines.append(f"- {s}")
                    elif isinstance(s, dict):
                        url = s.get("url", s.get("link", ""))
                        title = s.get("title", s.get("name", url))
                        lines.append(f"- [{title}]({url})")
            lines.append("")

    return "\n".join(lines)


def main():
    print("Loading fields definition...")
    field_map, cat_map = load_fields(FIELDS_YAML)
    print(f"  {len(field_map)} fields across {len(cat_map)} categories")

    print("Loading research results...")
    items = load_results(RESULTS_DIR)
    print(f"  {len(items)} items loaded")

    print("Generating report...")
    report = build_report(items, field_map, cat_map)

    with open(OUTPUT_FILE, "w") as f:
        f.write(report)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\nReport written to: {OUTPUT_FILE}")
    print(f"Size: {size_kb:.1f} KB")
    print(f"Lines: {report.count(chr(10))}")


if __name__ == "__main__":
    main()
