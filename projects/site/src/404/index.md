---
{
  title: '404',
  layout: 'page.11ty.js',
  permalink: '404.html' // needed for Gitlab Pages specfic path
}
---

<link rel="stylesheet" href="./404/index.css" />
<script type="module" src="./404/index.ts"></script>

<div nve-layout="column gap:lg pad:lg">

# {{ title }}

<div>
  <nvd-not-found></nvd-not-found>
</div>

</div>
