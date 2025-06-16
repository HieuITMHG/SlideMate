import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const CustomBarChart = ({
  data,
  color = "cyan",
  width = "100%",
  height = 300,
  dataKeyLabel = "label",
  dataKeyValue = "value"
}) =>{
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKeyLabel} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKeyValue} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}
export default CustomBarChart;
