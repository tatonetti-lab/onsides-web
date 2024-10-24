import axios from "axios";

axios.defaults.baseURL = "https://onsidesdb.org/api";

export const getAllDrugs = async () => {
  let res;
  try {
    res = await axios.get("/drugs");
  } catch (err) {
    res = console.log(err);
  }
  return res.data;
};

export const getAllAdverseReactions = async () => {
  let res;
  try {
    res = await axios.get("/adversereactions");
  } catch (err) {
    res = console.log(err);
  }
  return res.data;
};

export const queryKeyword = async (keyword) => {
  let res;
  try {
    res = await axios.get("/query/" + keyword);
  } catch (err) {
    res = console.log(err);
  }
  return res.data;
};

export const getDrugsByAdverseReaction = async (meddraID) => {
  return axios
    .get("/adversereactions/" + meddraID)
    .catch((err) => console.log(err))
    .then((res) => {
      return res.data;
    });
};

export const getDrugInfo = async (drugID) => {
  return axios
    .get("/drugs/" + drugID)
    .catch((err) => console.log(err))
    .then((res) => {
      return res.data;
    });
};

export const getStats = async () => {
  return axios
    .get("/stats")
    .catch((err) => console.log(err))
    .then((res) => {
      return res.data;
    });
};
