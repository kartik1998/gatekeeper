const axios = require('axios').default;

(async function () {
  const result = await axios.get('http://localhost:5000/time/1');
  console.log({ data: result.data });
}());
