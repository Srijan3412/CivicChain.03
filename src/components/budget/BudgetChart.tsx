      {/* ✅ Bar Chart */}
      <TabsContent value="bar" className="mt-6">
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={chartData}
            margin={{ left: 90, right: 30, top: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={120}
              fontSize={10}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis tickFormatter={formatCompactNumber} width={75} />
            <Tooltip
              formatter={(value: number) => [formatIndianCurrency(value), 'Amount']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>

      {/* ✅ Pie Chart */}
      <TabsContent value="pie" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="amount"
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatIndianCurrency(value), 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => `${value}`}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Budget Breakdown</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pieData.map((entry, index) => {
                const percentage = ((entry.amount / total) * 100).toFixed(1);
                return (
                  <div
                    key={entry.category}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{entry.category}</div>
                      <div className="text-muted-foreground">
                        {formatIndianCurrency(entry.amount)} ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
