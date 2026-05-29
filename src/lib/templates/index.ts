import type { TemplateKey } from "../types";
import { articleTemplate } from "./article";
import { documentationTemplate } from "./documentation";
import { galleryTemplate } from "./gallery";
import { letterTemplate } from "./letter";
import type { Template } from "./types";

export const TEMPLATES: Template[] = [
  articleTemplate,
  documentationTemplate,
  galleryTemplate,
  letterTemplate,
];

export function getTemplate(key: TemplateKey): Template {
  return TEMPLATES.find((t) => t.key === key) ?? articleTemplate;
}

export type { Template, TemplateContext } from "./types";
