export default function Table({ columns, rows, rowKey = "id", emptyMessage = "No records yet." }) {
  if (!rows || rows.length === 0) {
    return <div className="empty-state"><p>{emptyMessage}</p></div>;
  }
  return (
    <table className="table">
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[rowKey]}>
            {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
