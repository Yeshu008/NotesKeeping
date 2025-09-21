import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1NDczNjQ0MiwianRpIjoiMDU5ZjI2NTQtNzAwMy00YjU3LTllNTYtZGZiODJiODY1MzZmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImNjNzI0ODEzLTc0ZGYtNGE1OS1iMTg0LTM0YjU5YmQ3YzZlYyIsIm5iZiI6MTc1NDczNjQ0MiwiZXhwIjoxNzU0NzQwMDQyfQ.e2q9fA787d3SpVV_AgaGZIJ_2AlSl7eAnYhL66wcDPE';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  };

  const payload = JSON.stringify({
    note_title: "Performance Test Note",
    note_content: "This is a test note",
  });

  const res = http.post('http://localhost:5000/api/notes', payload, { headers });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
