import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function FeatureProduct() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("http://localhost:5000/api/dataProduk")
      .then((response) => setData(response.data))
      .catch((err) => console.error(err));
  };

  return (
    <>
      {data.map((item) => (
          <div key={item.id_buku} className="col">
            <div className="card shadow-sm">
              <img
                className="card-img-top bg-dark cover"
                height="240"
                alt={item.judul}
                src={`http://localhost:5000/images/${item.gmbr_buku}`}
                style={{ objectFit: "fill", height: "240px" }}
              />
              <div className="card-body">
                <h5 className="card-title text-center">{item.judul}</h5>
                <p className="card-text text-center text-muted">{item.genre}</p>
                <div className="d-grid gap-2">
                  <Link
                    to={`/products/${item.id_buku}`}
                    className="btn btn-outline-dark"
                    replace
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>  
      ))}
    </> 
  );
}

export default FeatureProduct;