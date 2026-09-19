from pathlib import Path

project = "Elements Sphinx Starter"
author = "NVIDIA"
copyright = "2026, NVIDIA CORPORATION & AFFILIATES"

extensions = ["myst_parser"]
source_suffix = {".md": "markdown"}
root_doc = "index"
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

myst_enable_extensions = ["colon_fence", "deflist", "fieldlist"]
myst_heading_anchors = 3

html_theme = "nvidia_elements"
html_theme_path = [str(Path(__file__).parent / "_themes")]
html_title = project
html_short_title = "NVIDIA Elements + Sphinx"
html_show_sourcelink = False
html_copy_source = False
html_show_sphinx = True
html_js_files = [("elements.js", {"defer": "defer"})]

nitpicky = True
