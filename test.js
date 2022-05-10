const axios = require("axios");

// axios
//   .get(" https://lereacteur-vinted-api.herokuapp.com/offers/")
//   .then((response) => {
//     console.log(response.data);
//   })
//   .catch((e) => {
//     console.log(e.message);
//   });
const fetchData = async () => {
  const response = await axios.get(
    " https://lereacteur-vinted-api.herokuapp.com/offers/"
  );
  //   response.data.map((item, index) => {
  //     console.log(item);
  //   });
};
fetchData();
