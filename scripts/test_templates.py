#!/usr/bin/env python3
"""Quick Jinja2 template syntax validation."""
import sys
from jinja2 import Environment, FileSystemLoader, TemplateSyntaxError

template_dir = "/home/z/my-project/templates"
env = Environment(loader=FileSystemLoader(template_dir))

templates_to_check = ["landing.html", "login.html", "admin.html", "menu.html"]
errors = []

for tpl in templates_to_check:
    try:
        env.get_template(tpl)
        with open(f"{template_dir}/{tpl}") as f:
            source = f.read()
        env.parse(source)
        print(f"OK: {tpl}")
    except TemplateSyntaxError as e:
        print(f"FAIL: {tpl} — {e}")
        errors.append(tpl)

print()
if errors:
    print(f"FAILED templates: {', '.join(errors)}")
    sys.exit(1)
else:
    print("All templates valid.")
    sys.exit(0)
