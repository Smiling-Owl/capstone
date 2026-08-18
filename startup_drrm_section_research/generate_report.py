import json
import re
from pathlib import Path


ROOT = Path(__file__).parent
RESULTS = ROOT / "results"
CATEGORY_MAPPING = {
    "Basic Info": ["basic_info", "Basic Info"],
    "Technical Features": ["technical_features", "technical_characteristics", "Technical Features"],
    "Performance Metrics": ["performance_metrics", "performance", "Performance Metrics"],
    "Milestone Significance": ["milestone_significance", "milestones", "Milestone Significance"],
    "Business Info": ["business_info", "commercial_info", "Business Info"],
    "Competition & Ecosystem": ["competition_ecosystem", "competition", "Competition & Ecosystem"],
    "History": ["history", "History"],
    "Market Positioning": ["market_positioning", "market", "Market Positioning"],
}


def field_structure():
    categories, current = [], None
    for line in (ROOT / "fields.yaml").read_text(encoding="utf-8").splitlines():
        match = re.match(r'\s*- name: "([^"]+)"', line)
        if not match:
            continue
        name = match.group(1)
        if line.startswith("  - name:"):
            current = {"name": name, "fields": []}
            categories.append(current)
        elif current:
            current["fields"].append(name)
    return categories


def find_value(data, category, field):
    if field in data:
        return data[field]
    keys = [category, category.lower().replace(" ", "_")]
    keys += CATEGORY_MAPPING.get(category, [])
    for key in keys:
        if isinstance(data.get(key), dict) and field in data[key]:
            return data[key][field]
    for value in data.values():
        if isinstance(value, dict):
            found = find_value(value, category, field)
            if found is not None:
                return found
    return None


def uncertain(value):
    if value is None or value == "":
        return True
    if isinstance(value, str):
        return "[uncertain]" in value
    return any(uncertain(v) for v in value) if isinstance(value, list) else False


def format_value(value):
    if isinstance(value, dict):
        return "<br>".join(f"**{pretty(k)}:** {format_value(v)}" for k, v in value.items())
    if isinstance(value, list):
        if not value:
            return ""
        if all(isinstance(v, dict) for v in value):
            return "<br>".join(" | ".join(f"{pretty(k)}: {format_value(x)}" for k, x in v.items()) for v in value)
        rendered = [format_value(v) for v in value]
        return ", ".join(rendered) if len(rendered) <= 3 else "<br>".join(f"- {v}" for v in rendered)
    text = str(value)
    return text if len(text) <= 100 else text.replace(". ", ".<br>")


def pretty(name):
    return name.replace("_", " ").strip().title()


def anchor(name):
    return re.sub(r"[^a-z0-9 -]", "", name.lower()).replace(" ", "-")


def main():
    structure = field_structure()
    documents = [(path.stem.replace("_", " "), json.loads(path.read_text(encoding="utf-8")), path.name)
                 for path in sorted(RESULTS.glob("*.json"))]
    lines = ["# Startup DRRM Section Research Report", "", "## Table of Contents", ""]
    for number, (name, _, _) in enumerate(documents, 1):
        lines.append(f"{number}. [{name}](#{anchor(name)})")

    known = {field for category in structure for field in category["fields"]}
    internal = {"_source_file", "uncertain"}
    containers = {key for values in CATEGORY_MAPPING.values() for key in values}
    containers.update(category["name"] for category in structure)

    for name, data, source_file in documents:
        lines += ["", f"## {name}", "", f"Source file: `{source_file}`"]
        omitted = set(data.get("uncertain", []))
        for category in structure:
            entries = []
            for field in category["fields"]:
                value = find_value(data, category["name"], field)
                if field not in omitted and not uncertain(value):
                    entries += [f"### {pretty(field)}", "", format_value(value), ""]
            if entries:
                lines += ["", f"### {category['name']}", ""] + entries

        extras = []
        def collect(value):
            if not isinstance(value, dict):
                return
            for key, item in value.items():
                if key in internal or key in containers:
                    collect(item)
                elif key not in known and key not in omitted and not uncertain(item):
                    extras.append((key, item))
        collect(data)
        if extras:
            lines += ["", "### Other Info", ""]
            for key, value in extras:
                lines += [f"#### {pretty(key)}", "", format_value(value), ""]

    (ROOT / "report.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
