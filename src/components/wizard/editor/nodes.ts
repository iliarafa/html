// Custom TipTap nodes. Each node's renderHTML emits the EXACT markup the final file
// uses (semantic HTML + class/data hooks). parseHTML is kept symmetric so importing
// previously-generated content round-trips. Interactive editing UI lives in NodeViews
// (only where attribute editing is needed); NodeViews don't affect serialized output.

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CollapsibleView from "./views/CollapsibleView";
import TabsView from "./views/TabsView";
import TabPanelView from "./views/TabPanelView";

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (el) => el.getAttribute("data-variant") || "info",
        renderHTML: (attrs) => ({ "data-variant": attrs.variant }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "aside.callout" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { class: "callout" }), 0];
  },
});

export const QuoteCard = Node.create({
  name: "quoteCard",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "figure.quote-card", contentElement: "blockquote" }];
  },
  renderHTML() {
    return ["figure", { class: "quote-card" }, ["blockquote", {}, 0]];
  },
});

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column column",
  parseHTML() {
    return [{ tag: "div.columns" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "columns" }), 0];
  },
});

export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,
  parseHTML() {
    return [{ tag: "div.col" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "col" }), 0];
  },
});

export const ImageFigure = Node.create({
  name: "imageFigure",
  group: "block",
  content: "inline*",
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure.figure",
        contentElement: "figcaption",
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector("img");
          return img
            ? { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" }
            : false;
        },
      },
    ];
  },
  renderHTML({ node }) {
    return [
      "figure",
      { class: "figure" },
      ["img", { src: node.attrs.src, alt: node.attrs.alt }],
      ["figcaption", {}, 0],
    ];
  },
});

export const Collapsible = Node.create({
  name: "collapsible",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return { summary: { default: "Details" } };
  },
  parseHTML() {
    return [
      {
        tag: "details.collapsible",
        contentElement: ".collapsible-body",
        getAttrs: (el) => ({
          summary: (el as HTMLElement).querySelector("summary")?.textContent || "Details",
        }),
      },
    ];
  },
  renderHTML({ node }) {
    return [
      "details",
      { class: "collapsible" },
      ["summary", {}, node.attrs.summary || "Details"],
      ["div", { class: "collapsible-body" }, 0],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleView);
  },
});

export const Tabs = Node.create({
  name: "tabs",
  group: "block",
  content: "tabPanel+",
  parseHTML() {
    return [{ tag: "div.tabs[data-tabs]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "tabs", "data-tabs": "" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TabsView);
  },
});

export const TabPanel = Node.create({
  name: "tabPanel",
  content: "block+",
  isolating: true,
  addAttributes() {
    return {
      label: {
        default: "Tab",
        parseHTML: (el) => el.getAttribute("data-label") || "Tab",
        renderHTML: (attrs) => ({ "data-label": attrs.label }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "section.tabpanel" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, { class: "tabpanel" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TabPanelView);
  },
});
