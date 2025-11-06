import { JSONSchema7, zodSchema } from "ai";
import { z } from "zod";

const ResponseComponent = (() => {
  const UIComponent: z.ZodTypeAny = z.lazy(() =>
    z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("text"),
          text: z.string(),
          variant: z
            .enum(["title", "subtitle", "body", "caption", "code"])
            .default("body"),
          align: z.enum(["start", "center", "end", "justify"]).default("start"),
          style: z
            .object({
              bold: z.boolean().default(false),
              italic: z.boolean().default(false),
              underline: z.boolean().default(false),
              strike: z.boolean().default(false),
              code: z.boolean().default(false),
              color: z.string().nullable().default(null),
            })
            .strict()
            .default({
              bold: false,
              italic: false,
              underline: false,
              strike: false,
              code: false,
              color: null,
            }),
        })
        .strict(),

      z
        .object({
          type: z.literal("flex"),
          direction: z.enum(["row", "column"]),
          align: z
            .enum(["start", "center", "end", "stretch"])
            .default("stretch"),
          justify: z
            .enum(["start", "center", "end", "between", "around", "evenly"])
            .default("start"),
          wrap: z.boolean().default(false),
          children: z.array(UIComponent).max(50).default([]),
        })
        .strict(),

      z
        .object({
          type: z.literal("image"),
          src: z.string().min(1).nullable().default(null),
          searchQuery: z.string().min(1).nullable().default(null),
          alt: z.string().default(""),
          fit: z
            .enum(["cover", "contain", "fill", "none", "scale-down"])
            .default("cover"),
          radius: z.number().int().min(0).max(64).default(0),
        })
        .strict(),

      z
        .object({
          type: z.literal("list"),
          ordered: z.boolean().default(false),
          bulletType: z
            .enum(["disc", "circle", "square", "decimal", "none"])
            .default("disc"),
          children: z.array(UIComponent).max(50).default([]),
        })
        .strict(),

      z
        .object({
          type: z.literal("button"),
          label: z.string().min(1),
          action: z.string().min(1),
          variant: z
            .enum(["primary", "secondary", "outline", "ghost"])
            .default("primary"),
          size: z.enum(["sm", "md", "lg"]).default("md"),
        })
        .strict(),

      z
        .object({
          type: z.literal("input"),
          id: z.string().min(1),
          label: z.string().default(""),
          placeholder: z.string().default(""),
          inputType: z
            .enum(["text", "email", "password", "number", "tel", "url"])
            .default("text"),
          required: z.boolean().default(false),
        })
        .strict(),

      z
        .object({
          type: z.literal("textarea"),
          id: z.string().min(1),
          label: z.string().default(""),
          placeholder: z.string().default(""),
          rows: z.number().int().min(2).max(20).default(4),
          required: z.boolean().default(false),
        })
        .strict(),

      z
        .object({
          type: z.literal("select"),
          id: z.string().min(1),
          label: z.string().default(""),
          placeholder: z.string().default("Select an option"),
          options: z
            .array(
              z.object({
                value: z.string(),
                label: z.string(),
              }),
            )
            .min(1),
          required: z.boolean().default(false),
        })
        .strict(),

      z
        .object({
          type: z.literal("chart"),
          chartType: z.enum(["bar", "line", "area", "pie"]).default("bar"),
          title: z.string().default(""),
          description: z.string().default(""),
          data: z
            .array(z.record(z.string(), z.union([z.string(), z.number()])))
            .min(1),
          config: z.object({
            xKey: z.string(),
            yKeys: z.array(
              z.object({
                key: z.string(),
                label: z.string(),
                color: z.string(),
              }),
            ),
          }),
        })
        .strict(),

      z
        .object({
          type: z.literal("badge"),
          text: z.string().min(1),
          variant: z
            .enum(["default", "success", "warning", "error", "info"])
            .default("default"),
        })
        .strict(),

      z
        .object({
          type: z.literal("progress"),
          value: z.number().min(0),
          max: z.number().min(1).default(100),
          showLabel: z.boolean().default(true),
          label: z.string().default("Progress"),
        })
        .strict(),

      z
        .object({
          type: z.literal("alert"),
          title: z.string().default(""),
          description: z.string().default(""),
          variant: z
            .enum(["default", "success", "warning", "error", "info"])
            .default("default"),
        })
        .strict(),

      z
        .object({
          type: z.literal("separator"),
          orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
        })
        .strict(),

      z
        .object({
          type: z.literal("accordion"),
          items: z
            .array(
              z.object({
                title: z.string(),
                content: z.array(UIComponent).max(20).default([]),
              }),
            )
            .min(1),
          allowMultiple: z.boolean().default(false),
        })
        .strict(),

      z
        .object({
          type: z.literal("tabs"),
          tabs: z
            .array(
              z.object({
                label: z.string(),
                content: z.array(UIComponent).max(20).default([]),
              }),
            )
            .min(1),
        })
        .strict(),

      z
        .object({
          type: z.literal("codeblock"),
          code: z.string().min(1),
          language: z.string().default("plaintext"),
          showLineNumbers: z.boolean().default(false),
        })
        .strict(),

      z
        .object({
          type: z.literal("card"),
          title: z.string().default(""),
          description: z.string().default(""),
          image: z.string().nullable().default(null),
          imageQuery: z.string().nullable().default(null),
          children: z.array(UIComponent).max(10).default([]),
          clickAction: z.string().nullable().default(null),
        })
        .strict(),

      z
        .object({
          type: z.literal("grid"),
          columns: z.number().int().min(1).max(3).default(2),
          children: z.array(UIComponent).max(20).default([]),
        })
        .strict(),

      z
        .object({
          type: z.literal("hero"),
          title: z.string().default(""),
          subtitle: z.string().default(""),
          backgroundImage: z.string().nullable().default(null),
          backgroundImageQuery: z.string().nullable().default(null),
          overlayColor: z.string().default("rgba(0,0,0,0.4)"),
          children: z.array(UIComponent).max(10).default([]),
        })
        .strict(),

      z
        .object({
          type: z.literal("stats"),
          items: z
            .array(
              z.object({
                label: z.string().default(""),
                value: z.string().default(""),
                change: z.string().default(""),
                trend: z
                  .enum(["up", "down", "neutral"])
                  .nullable()
                  .default(null),
                description: z.string().default(""),
                icon: z.string().nullable().default(null),
              }),
            )
            .max(8)
            .default([]),
        })
        .strict(),

      z
        .object({
          type: z.literal("metric"),
          label: z.string().default(""),
          value: z.string().default(""),
          change: z.string().default(""),
          trend: z.enum(["up", "down"]).nullable().default(null),
          prefix: z.string().default(""),
          suffix: z.string().default(""),
          description: z.string().default(""),
          variant: z
            .enum(["default", "primary", "success", "warning", "danger"])
            .default("default"),
        })
        .strict(),

      z
        .object({
          type: z.literal("comparison"),
          title: z.string().default(""),
          items: z
            .array(
              z.object({
                label: z.string().default(""),
                subtitle: z.string().default(""),
                children: z.array(UIComponent).max(10).default([]),
              }),
            )
            .min(2)
            .max(4)
            .default([]),
        })
        .strict(),

      z
        .object({
          type: z.literal("gallery"),
          title: z.string().default(""),
          images: z
            .array(
              z.object({
                image: z.string().nullable().default(null),
                imageQuery: z.string().nullable().default(null),
                title: z.string().default(""),
                subtitle: z.string().default(""),
                clickAction: z.string().nullable().default(null),
              }),
            )
            .max(12)
            .default([]),
          columns: z.number().int().min(1).max(3).default(3),
          aspectRatio: z.string().default("16/9"),
        })
        .strict(),

      z
        .object({
          type: z.literal("timeline"),
          items: z
            .array(
              z.object({
                date: z.string().default(""),
                title: z.string().default(""),
                description: z.string().default(""),
                active: z.boolean().default(false),
                children: z.array(UIComponent).max(5).default([]),
              }),
            )
            .max(10)
            .default([]),
          variant: z.enum(["vertical", "horizontal"]).default("vertical"),
        })
        .strict(),

      z
        .object({
          type: z.literal("feature"),
          title: z.string().default(""),
          description: z.string().default(""),
          icon: z.string().nullable().default(null),
          features: z
            .array(z.union([z.string(), UIComponent]))
            .max(10)
            .default([]),
          variant: z.enum(["default", "primary", "dark"]).default("default"),
        })
        .strict(),
    ]),
  );

  const Root = z
    .object({
      version: z.literal(1).default(1),
      children: z.array(UIComponent).max(100).default([]),
    })
    .strict();

  return Root;
})();

export const outputSchema = zodSchema(ResponseComponent, {
  useReferences: true,
});

export const staticSchema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    version: {
      default: 1,
      type: "number",
      const: 1,
    },
    children: {
      default: [],
      maxItems: 100,
      type: "array",
      items: {
        $ref: "#/definitions/UIComponent",
      },
    },
  },
  required: ["version", "children"],
  additionalProperties: false,
  definitions: {
    UIComponent: {
      anyOf: [
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "text",
            },
            text: {
              type: "string",
            },
            variant: {
              default: "body",
              type: "string",
              enum: ["title", "subtitle", "body", "caption", "code"],
            },
            align: {
              default: "start",
              type: "string",
              enum: ["start", "center", "end", "justify"],
            },
            style: {
              default: {
                bold: false,
                italic: false,
                underline: false,
                strike: false,
                code: false,
                color: null,
              },
              type: "object",
              properties: {
                bold: {
                  default: false,
                  type: "boolean",
                },
                italic: {
                  default: false,
                  type: "boolean",
                },
                underline: {
                  default: false,
                  type: "boolean",
                },
                strike: {
                  default: false,
                  type: "boolean",
                },
                code: {
                  default: false,
                  type: "boolean",
                },
                color: {
                  default: null,
                  anyOf: [
                    {
                      type: "string",
                    },
                    {
                      type: "null",
                    },
                  ],
                },
              },
              required: [
                "bold",
                "italic",
                "underline",
                "strike",
                "code",
                "color",
              ],
              additionalProperties: false,
            },
          },
          required: ["type", "text", "variant", "align", "style"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "flex",
            },
            direction: {
              type: "string",
              enum: ["row", "column"],
            },
            align: {
              default: "stretch",
              type: "string",
              enum: ["start", "center", "end", "stretch"],
            },
            justify: {
              default: "start",
              type: "string",
              enum: ["start", "center", "end", "between", "around", "evenly"],
            },
            wrap: {
              default: false,
              type: "boolean",
            },
            children: {
              default: [],
              maxItems: 50,
              type: "array",
              items: {
                $ref: "#/definitions/UIComponent",
              },
            },
          },
          required: [
            "type",
            "direction",
            "align",
            "justify",
            "wrap",
            "children",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "image",
            },
            searchQuery: {
              default: null,
              anyOf: [
                {
                  type: "string",
                  minLength: 1,
                },
                {
                  type: "null",
                },
              ],
            },
            alt: {
              default: "",
              type: "string",
            },
            fit: {
              default: "cover",
              type: "string",
              enum: ["cover", "contain", "fill", "none", "scale-down"],
            },
            radius: {
              default: 0,
              type: "integer",
              minimum: 0,
              maximum: 64,
            },
          },
          required: ["type", "searchQuery", "alt", "fit", "radius"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "list",
            },
            ordered: {
              default: false,
              type: "boolean",
            },
            bulletType: {
              default: "disc",
              type: "string",
              enum: ["disc", "circle", "square", "decimal", "none"],
            },
            children: {
              default: [],
              maxItems: 50,
              type: "array",
              items: {
                $ref: "#/definitions/UIComponent",
              },
            },
          },
          required: ["type", "ordered", "bulletType", "children"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "button",
            },
            label: {
              type: "string",
              minLength: 1,
            },
            action: {
              type: "string",
              minLength: 1,
            },
            variant: {
              default: "primary",
              type: "string",
              enum: ["primary", "secondary", "outline", "ghost"],
            },
            size: {
              default: "md",
              type: "string",
              enum: ["sm", "md", "lg"],
            },
          },
          required: ["type", "label", "action", "variant", "size"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "input",
            },
            id: {
              type: "string",
              minLength: 1,
            },
            label: {
              default: "",
              type: "string",
            },
            placeholder: {
              default: "",
              type: "string",
            },
            inputType: {
              default: "text",
              type: "string",
              enum: ["text", "email", "password", "number", "tel", "url"],
            },
            required: {
              default: false,
              type: "boolean",
            },
          },
          required: [
            "type",
            "id",
            "label",
            "placeholder",
            "inputType",
            "required",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "textarea",
            },
            id: {
              type: "string",
              minLength: 1,
            },
            label: {
              default: "",
              type: "string",
            },
            placeholder: {
              default: "",
              type: "string",
            },
            rows: {
              default: 4,
              type: "integer",
              minimum: 2,
              maximum: 20,
            },
            required: {
              default: false,
              type: "boolean",
            },
          },
          required: ["type", "id", "label", "placeholder", "rows", "required"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "select",
            },
            id: {
              type: "string",
              minLength: 1,
            },
            label: {
              default: "",
              type: "string",
            },
            placeholder: {
              default: "Select an option",
              type: "string",
            },
            options: {
              minItems: 1,
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: {
                    type: "string",
                  },
                  label: {
                    type: "string",
                  },
                },
                required: ["value", "label"],
                additionalProperties: false,
              },
            },
            required: {
              default: false,
              type: "boolean",
            },
          },
          required: [
            "type",
            "id",
            "label",
            "placeholder",
            "options",
            "required",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "chart",
            },
            chartType: {
              default: "bar",
              type: "string",
              enum: ["bar", "line", "area", "pie"],
            },
            title: {
              default: "",
              type: "string",
            },
            description: {
              default: "",
              type: "string",
            },
            data: {
              minItems: 1,
              type: "array",
              items: {
                type: "object",
                propertyNames: {
                  type: "string",
                },
                additionalProperties: {
                  anyOf: [
                    {
                      type: "string",
                    },
                    {
                      type: "number",
                    },
                  ],
                },
              },
            },
            config: {
              type: "object",
              properties: {
                xKey: {
                  type: "string",
                },
                yKeys: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: {
                        type: "string",
                      },
                      label: {
                        type: "string",
                      },
                      color: {
                        type: "string",
                      },
                    },
                    required: ["key", "label", "color"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["xKey", "yKeys"],
              additionalProperties: false,
            },
          },
          required: [
            "type",
            "chartType",
            "title",
            "description",
            "data",
            "config",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "badge",
            },
            text: {
              type: "string",
              minLength: 1,
            },
            variant: {
              default: "default",
              type: "string",
              enum: ["default", "success", "warning", "error", "info"],
            },
          },
          required: ["type", "text", "variant"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "progress",
            },
            value: {
              type: "number",
              minimum: 0,
            },
            max: {
              default: 100,
              type: "number",
              minimum: 1,
            },
            showLabel: {
              default: true,
              type: "boolean",
            },
            label: {
              default: "Progress",
              type: "string",
            },
          },
          required: ["type", "value", "max", "showLabel", "label"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "alert",
            },
            title: {
              default: "",
              type: "string",
            },
            description: {
              default: "",
              type: "string",
            },
            variant: {
              default: "default",
              type: "string",
              enum: ["default", "success", "warning", "error", "info"],
            },
          },
          required: ["type", "title", "description", "variant"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "separator",
            },
            orientation: {
              default: "horizontal",
              type: "string",
              enum: ["horizontal", "vertical"],
            },
          },
          required: ["type", "orientation"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "accordion",
            },
            items: {
              minItems: 1,
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  content: {
                    default: [],
                    maxItems: 20,
                    type: "array",
                    items: {
                      $ref: "#/definitions/UIComponent",
                    },
                  },
                },
                required: ["title", "content"],
                additionalProperties: false,
              },
            },
            allowMultiple: {
              default: false,
              type: "boolean",
            },
          },
          required: ["type", "items", "allowMultiple"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "tabs",
            },
            tabs: {
              minItems: 1,
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                  },
                  content: {
                    default: [],
                    maxItems: 20,
                    type: "array",
                    items: {
                      $ref: "#/definitions/UIComponent",
                    },
                  },
                },
                required: ["label", "content"],
                additionalProperties: false,
              },
            },
          },
          required: ["type", "tabs"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "codeblock",
            },
            code: {
              type: "string",
              minLength: 1,
            },
            language: {
              default: "plaintext",
              type: "string",
            },
            showLineNumbers: {
              default: false,
              type: "boolean",
            },
          },
          required: ["type", "code", "language", "showLineNumbers"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "card",
            },
            title: {
              default: "",
              type: "string",
            },
            description: {
              default: "",
              type: "string",
            },
            imageQuery: {
              default: null,
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "null",
                },
              ],
            },
            children: {
              default: [],
              maxItems: 10,
              type: "array",
              items: {
                $ref: "#/definitions/UIComponent",
              },
            },
            clickAction: {
              default: null,
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "null",
                },
              ],
            },
          },
          required: [
            "type",
            "title",
            "description",
            "imageQuery",
            "children",
            "clickAction",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "grid",
            },
            columns: {
              default: 2,
              type: "integer",
              minimum: 1,
              maximum: 3,
            },
            children: {
              default: [],
              maxItems: 20,
              type: "array",
              items: {
                $ref: "#/definitions/UIComponent",
              },
            },
          },
          required: ["type", "columns", "children"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "hero",
            },
            title: {
              default: "",
              type: "string",
            },
            subtitle: {
              default: "",
              type: "string",
            },
            backgroundImageQuery: {
              default: null,
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "null",
                },
              ],
            },
            overlayColor: {
              default: "rgba(0,0,0,0.4)",
              type: "string",
            },
            children: {
              default: [],
              maxItems: 10,
              type: "array",
              items: {
                $ref: "#/definitions/UIComponent",
              },
            },
          },
          required: [
            "type",
            "title",
            "subtitle",
            "backgroundImageQuery",
            "overlayColor",
            "children",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "stats",
            },
            items: {
              default: [],
              maxItems: 8,
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    default: "",
                    type: "string",
                  },
                  value: {
                    default: "",
                    type: "string",
                  },
                  change: {
                    default: "",
                    type: "string",
                  },
                  trend: {
                    default: null,
                    anyOf: [
                      {
                        type: "string",
                        enum: ["up", "down", "neutral"],
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                  description: {
                    default: "",
                    type: "string",
                  },
                  icon: {
                    default: null,
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                },
                required: [
                  "label",
                  "value",
                  "change",
                  "trend",
                  "description",
                  "icon",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["type", "items"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "metric",
            },
            label: {
              default: "",
              type: "string",
            },
            value: {
              default: "",
              type: "string",
            },
            change: {
              default: "",
              type: "string",
            },
            trend: {
              default: null,
              anyOf: [
                {
                  type: "string",
                  enum: ["up", "down"],
                },
                {
                  type: "null",
                },
              ],
            },
            prefix: {
              default: "",
              type: "string",
            },
            suffix: {
              default: "",
              type: "string",
            },
            description: {
              default: "",
              type: "string",
            },
            variant: {
              default: "default",
              type: "string",
              enum: ["default", "primary", "success", "warning", "danger"],
            },
          },
          required: [
            "type",
            "label",
            "value",
            "change",
            "trend",
            "prefix",
            "suffix",
            "description",
            "variant",
          ],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "comparison",
            },
            title: {
              default: "",
              type: "string",
            },
            items: {
              default: [],
              minItems: 2,
              maxItems: 4,
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    default: "",
                    type: "string",
                  },
                  subtitle: {
                    default: "",
                    type: "string",
                  },
                  children: {
                    default: [],
                    maxItems: 10,
                    type: "array",
                    items: {
                      $ref: "#/definitions/UIComponent",
                    },
                  },
                },
                required: ["label", "subtitle", "children"],
                additionalProperties: false,
              },
            },
          },
          required: ["type", "title", "items"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "gallery",
            },
            title: {
              default: "",
              type: "string",
            },
            images: {
              default: [],
              maxItems: 12,
              type: "array",
              items: {
                type: "object",
                properties: {
                  imageQuery: {
                    default: null,
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                  title: {
                    default: "",
                    type: "string",
                  },
                  subtitle: {
                    default: "",
                    type: "string",
                  },
                  clickAction: {
                    default: null,
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                },
                required: ["imageQuery", "title", "subtitle", "clickAction"],
                additionalProperties: false,
              },
            },
            columns: {
              default: 3,
              type: "integer",
              minimum: 1,
              maximum: 3,
            },
            aspectRatio: {
              default: "16/9",
              type: "string",
            },
          },
          required: ["type", "title", "images", "columns", "aspectRatio"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "timeline",
            },
            items: {
              default: [],
              maxItems: 10,
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: {
                    default: "",
                    type: "string",
                  },
                  title: {
                    default: "",
                    type: "string",
                  },
                  description: {
                    default: "",
                    type: "string",
                  },
                  active: {
                    default: false,
                    type: "boolean",
                  },
                  children: {
                    default: [],
                    maxItems: 5,
                    type: "array",
                    items: {
                      $ref: "#/definitions/UIComponent",
                    },
                  },
                },
                required: [
                  "date",
                  "title",
                  "description",
                  "active",
                  "children",
                ],
                additionalProperties: false,
              },
            },
            variant: {
              default: "vertical",
              type: "string",
              enum: ["vertical", "horizontal"],
            },
          },
          required: ["type", "items", "variant"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              const: "feature",
            },
            title: {
              default: "",
              type: "string",
            },
            description: {
              default: "",
              type: "string",
            },
            icon: {
              default: null,
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "null",
                },
              ],
            },
            features: {
              default: [],
              maxItems: 10,
              type: "array",
              items: {
                anyOf: [
                  {
                    type: "string",
                  },
                  {
                    $ref: "#/definitions/UIComponent",
                  },
                ],
              },
            },
            variant: {
              default: "default",
              type: "string",
              enum: ["default", "primary", "dark"],
            },
          },
          required: [
            "type",
            "title",
            "description",
            "icon",
            "features",
            "variant",
          ],
          additionalProperties: false,
        },
      ],
    },
  },
};
