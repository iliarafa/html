"use client";

import type { WizardState } from "./state";
import { Field, StepLabel, StepTitle, TextInput } from "./ui";

export default function DetailsStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div>
      <StepLabel>Step 2</StepLabel>
      <StepTitle>Title &amp; details</StepTitle>

      <Field label="Title" hint="Shown in the browser tab and at the top of the page.">
        <TextInput
          value={state.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="My Notes"
        />
      </Field>
      <Field label="Subtitle (optional)">
        <TextInput
          value={state.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="A short description"
        />
      </Field>
      <Field label="Author (optional)">
        <TextInput
          value={state.author}
          onChange={(e) => update({ author: e.target.value })}
          placeholder="Your name"
        />
      </Field>
      <Field label="Date">
        <TextInput
          value={state.date}
          onChange={(e) => update({ date: e.target.value })}
          placeholder="May 29, 2026"
        />
      </Field>
    </div>
  );
}
