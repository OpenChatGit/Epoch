"use client";

import { ChartComponent } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartRendererProps {
  component: ChartComponent;
  isInFlexRow?: boolean;
}

export function ChartRenderer({
  component,
  isInFlexRow = false,
}: ChartRendererProps) {
  const { chartType = "bar", title, description, data, config } = component;

  if (
    !data ||
    !config ||
    !config.xKey ||
    !config.yKeys ||
    config.yKeys.length === 0
  ) {
    return null;
  }

  const xKey = config.xKey;
  const yKeys = config.yKeys;

  const chartConfig = yKeys.reduce((acc, yKey, index) => {
    if (!yKey.key) return acc;
    acc[yKey.key] = {
      label: yKey.label || yKey.key,
      color: `var(--chart-${(index % 5) + 1})`,
    };
    return acc;
  }, {} as ChartConfig);

  const gradients = [
    { id: "gradient1", from: "#ec4899", to: "#f97316" },
    { id: "gradient2", from: "#14b8a6", to: "#06b6d4" },
    { id: "gradient3", from: "#8b5cf6", to: "#d946ef" },
    { id: "gradient4", from: "#0ea5e9", to: "#3b82f6" },
    { id: "gradient5", from: "#f59e0b", to: "#eab308" },
  ];

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ChartContainer
            config={chartConfig}
            className="min-h-[300px] w-full shadow-none border-gray-200"
          >
            <BarChart accessibilityLayer data={data}>
              <defs>
                {gradients.map((gradient, index) => (
                  <linearGradient
                    key={gradient.id}
                    id={gradient.id}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={gradient.from}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor={gradient.to}
                      stopOpacity={0.7}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {yKeys.map((yKey, index) => (
                <Bar
                  key={yKey.key}
                  dataKey={yKey.key!}
                  fill={`url(#${gradients[index % gradients.length].id})`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        );

      case "line":
        return (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart accessibilityLayer data={data}>
              <defs>
                {gradients.map((gradient, index) => (
                  <linearGradient
                    key={gradient.id}
                    id={gradient.id}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={gradient.from} />
                    <stop offset="100%" stopColor={gradient.to} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {yKeys.map((yKey, index) => (
                <Line
                  key={yKey.key}
                  type="monotone"
                  dataKey={yKey.key!}
                  stroke={`url(#${gradients[index % gradients.length].id})`}
                  strokeWidth={3}
                  dot={{
                    fill: gradients[index % gradients.length].from,
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        );

      case "area":
        return (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <AreaChart accessibilityLayer data={data}>
              <defs>
                {gradients.map((gradient, index) => (
                  <linearGradient
                    key={gradient.id}
                    id={gradient.id}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={gradient.from}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={gradient.to}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {yKeys.map((yKey, index) => (
                <Area
                  key={yKey.key}
                  type="monotone"
                  dataKey={yKey.key!}
                  stroke={gradients[index % gradients.length].from}
                  strokeWidth={2}
                  fill={`url(#${gradients[index % gradients.length].id})`}
                  stackId={index === 0 ? "1" : undefined}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        );

      case "pie":
        const firstYKey = yKeys[0].key;
        if (!firstYKey) return null;

        const pieData = data.map((item, index) => ({
          name: item[xKey] as string,
          value: item[firstYKey] as number,
          fill: `url(#pie-gradient-${index})`,
        }));

        return (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <PieChart>
              <defs>
                {pieData.map((_, index) => {
                  const gradient = gradients[index % gradients.length];
                  return (
                    <linearGradient
                      key={`pie-gradient-${index}`}
                      id={`pie-gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={gradient.from} />
                      <stop offset="100%" stopColor={gradient.to} />
                    </linearGradient>
                  );
                })}
              </defs>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              />
            </PieChart>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={cn("shadow-sm", isInFlexRow ? "flex-1 min-w-0" : "w-full")}
    >
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
