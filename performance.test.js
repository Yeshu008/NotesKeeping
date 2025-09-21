import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

const BASE_URL = 'http://localhost:5000/api/notes';
const TOKEN = 'YOUR_JWT_ACCESS_TOKEN';

export default function () {
  let res = http.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}