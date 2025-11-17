## RN Gestor – Form Builder Core

This repo now ships an intelligent, tag-based form framework that powers dynamic inventory flows inside the LineCards experience. It is engineered for two extremes: a minimalist read-only surface for quick data capture and a highly composable builder for rich validations, conditional layouts, and runtime actions.

### Highlights
- **Declarative DSL** – author schemas via `FormSchema`, `FormSectionDefinition` and typed `FormFieldDefinition`s in `app/framework/form-builder/schema.ts`.
- **Runtime Builder** – `FormBuilder` in `app/framework/form-builder/builder.tsx` converts the DSL into Tailwind-styled UI with validation, action orchestration, and state tracking.
- **Tag Factory** – `createFormTag(schema, options)` emits reusable components that encapsulate defaults for navigation dialogs, modals, or inline editors.
- **Extensible Registry** – override or extend field renderers using `FieldRegistry` (`registry.tsx`) to introduce bespoke controls while reusing shared layout tokens.

### Quick Start
```bash
# Install deps and validate
npm install
npm run lint

# Run the playground
npm run dev
```
Open `http://localhost:3000` to explore `app/components/LineCardsDemo.tsx`, which now embeds three LineCards modes plus the new `FormBuilderShowcase` (`app/components/forms/FormBuilderShowcase.tsx`).

### Creating a Form Schema
```ts
import { FormSchema, createFormTag } from '@/app/framework/form-builder';

const profileSchema: FormSchema = {
	key: 'profile-minimal',
	title: 'Perfil',
	sections: [
		{
			key: 'identity',
			orientation: 'vertical',
			fields: [
				{ key: 'name', type: 'text', label: 'Nome', validations: [{ type: 'required' }] },
				{ key: 'role', type: 'select', label: 'Cargo', options: [...] },
			],
		},
	],
};

const ProfileForm = createFormTag(profileSchema, {
	onSubmit: async (state) => console.log('payload', state.values),
});
```

Render it anywhere:

```tsx
<ProfileForm initialValues={{ name: 'Maria' }} />
```

### Advanced Usage
- **Custom fields** – set `type: 'custom'` and supply a `renderer` that receives `FormFieldRenderProps`.
- **Action wiring** – add items to `schema.actions` to control primary/secondary buttons and attach async handlers via `onTrigger`.
- **Programmatic control** – leverage the context passed to custom validations and hooks to call `updateValue`, `runValidation`, or `submit` in response to business rules.

### Project Scripts
- `npm run dev` – Next.js dev server with Tailwind v4.
- `npm run build` – production bundle.
- `npm run lint` – ESLint (must stay green before merging).

### Folder Map
- `app/framework/form-builder` – DSL types, builder runtime, registry, validation helpers.
- `app/components/forms/FormBuilderShowcase.tsx` – demo pairing minimal and advanced schemas.
- `app/components/LineCardsDemo.tsx` – LineCards baseline plus the form showcase.

### Next Steps
1. Plug the builder into edit/create dialogs inside `app/components/estoque/line-list`.
2. Expand the registry with masked inputs, async selects, and schema-driven layout metadata.
3. Add Zod/Yup adapters for typed validation pipelines as requirements evolve.
