import axios from "axios";
import { useQuery } from "react-query";
import { Category } from "../entities";

function CategoryList() {
  const { data: categories, error, isLoading } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: () => axios.get('/categories').then(res => res.data)
  })

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Category List</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {categories!.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoryList;
