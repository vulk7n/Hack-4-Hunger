"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const staticData = [
  { name: "Jan", total: 2800 },
  { name: "Feb", total: 3200 },
  { name: "Mar", total: 2500 },
  { name: "Apr", total: 4100 },
  { name: "May", total: 3500 },
  { name: "Jun", total: 4500 },
  { name: "Jul", total: 3800 },
  { name: "Aug", total: 4800 },
  { name: "Sep", total: 3900 },
  { name: "Oct", total: 4200 },
  { name: "Nov", total: 4900 },
  { name: "Dec", total: 5200 },
];

export function DonationsChart() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null;
  }
  
  return (
    <Card className="bg-card backdrop-blur-md">
      <CardHeader>
        <CardTitle>Donations Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={staticData}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
