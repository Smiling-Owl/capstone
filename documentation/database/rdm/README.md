# Relational data model viewer

Open `index.html` in a browser. The viewer is an academic relational model generated from the executed PostgreSQL catalog; it does not maintain a second, hand-written copy of the schema.

- Search by relation or attribute, or filter by domain.
- Select a relation to inspect all attributes, keys, constraints, and cardinalities.
- Open **Connected RDM** from the overview or navigation to view every relation and foreign-key constraint in one SVG. Each table appears once, grouped by domain; the global boxes contain primary-key and foreign-key attributes, and link to the complete attribute view.
- Use **Fit complete model**, the zoom controls, or **100% / 24 px text** to navigate. Domain highlighting and relation focus retain the whole graph while emphasizing the selected area. **Center highlighted area** pans to that selection. Arrow keys pan the focused canvas.
- **Export complete RDM SVG** exports all relations and all declared foreign keys, regardless of the current highlight. The connected view also includes accessible relation links and the complete text list of FK mappings and cardinalities.
- Keep **Show FK labels** enabled for the implementation-level relational model. Underlined attributes are primary keys.
- Export an individual relation or its relationship sheets as SVG. Exports use 24 px text and 5 px entity outlines for import into Lucidchart or draw.io.
- Use the print view for a complete relation catalog.

Regenerate the catalog after editing the migration:

```powershell
cd development/supabase
npm run catalog
```

The migration remains the source of truth: `development/supabase/migrations/202609080001_initial_domain_schema.sql`.
