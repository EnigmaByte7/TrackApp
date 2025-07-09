import { v4 } from "uuid";

export default  function generate() {
    const id = v4()
    console.log(id);
    
    return id
}