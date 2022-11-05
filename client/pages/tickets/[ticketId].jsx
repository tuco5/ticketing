import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default function TicketPage({ ticket }) {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
}

TicketPage.getInitialProps = async ({ myAxios, query }) => {
  const { data } = await myAxios.get(`/api/tickets/${query.ticketId}`);

  return { ticket: data };
};
