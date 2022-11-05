export default function MyOrdersPage({ orders }) {
  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>
          {order.ticket.title} - {order.ticket.price} - {order.status}
        </li>
      ))}
    </ul>
  );
}

MyOrdersPage.getInitialProps = async ({ myAxios }) => {
  const { data } = await myAxios.get('/api/orders');
  return { orders: data };
};
