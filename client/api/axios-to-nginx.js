import axios from 'axios';

export default function axiosToNginx({ req }) {
  if (typeof window === 'undefined') {
    // We are on server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // We are on browser
    return axios.create({
      baseUrl: '/',
    });
  }
}
