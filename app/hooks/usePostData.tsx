import axios from "axios";
import { ProductData } from "@/app/utils/types";

type usePostDataProps = {
  setData: React.Dispatch<React.SetStateAction<ProductData[]>>;
}

const usePostData = ({ setData }: usePostDataProps) => {


  const sendData = async (data: ProductData) => {
    try {
      const response = await axios.post("/api/products", data);
      if (response.status === 201) { 
        setData((prevState: ProductData[]) => [
          ...prevState,
          response.data
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        console.log(err);
      }
    }
  }

  return {
    sendData,
  }

}

export default usePostData;