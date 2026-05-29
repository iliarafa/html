// The configured TipTap extension set: StarterKit (paragraph, headings, lists,
// marks, code block, blockquote, hr, history, link) + Image + Table + Placeholder +
// our custom block/interactive nodes.

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Callout,
  Collapsible,
  Column,
  Columns,
  ImageFigure,
  QuoteCard,
  TabPanel,
  Tabs,
} from "./nodes";

export const extensions = [
  StarterKit.configure({
    link: { openOnClick: false, autolink: true },
  }),
  Image.configure({ inline: false, allowBase64: true }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  Placeholder.configure({ placeholder: "Write or paste your notes…" }),
  Callout,
  QuoteCard,
  Columns,
  Column,
  ImageFigure,
  Collapsible,
  Tabs,
  TabPanel,
];
