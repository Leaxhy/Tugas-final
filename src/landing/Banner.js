import React, { useState, useEffect } from "react";
import axios from "axios";
import { Carousel } from "react-bootstrap";

function Banner() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("http://localhost:5000/api/dataProduk")
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ marginTop: "0px" }}>
      <Carousel>
        {data.map((item, index) => (
          <Carousel.Item key={index}>
            <div
              className="ratio"
              style={{ "--bs-aspect-ratio": "50%", maxHeight: "450px" }}
            >
              <img
                className="d-block w-100 h-100 bg-dark cover"
                alt=""
                src={`http://localhost:5000/images/${item.gmbr_buku}`}
              />
            </div>
            <Carousel.Caption
              // style={{ backdropFilter: "blur(5px)", padding: "10px" }}
            >
              {/* <h1>{item.nm_banner}</h1>
              <h3 style={{ color: "black" }}>{item.deskripsi}</h3> */}
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default Banner;