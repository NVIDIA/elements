export function normalizeContentDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value !== 'string') return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function getContentDates(data = {}) {
  return {
    datePublished: normalizeContentDate(
      data.datePublished ?? data.published ?? data.git?.created ?? data.git?.createdTime
    ),
    dateModified: normalizeContentDate(
      data.dateModified ?? data.modified ?? data.git?.modified ?? data.git?.modifiedTime
    )
  };
}

export function getExplicitModifiedDate(data = {}) {
  return normalizeContentDate(data.dateModified ?? data.modified);
}
