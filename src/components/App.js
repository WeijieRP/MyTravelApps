import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "../index.css";

const initialItems = [
  { id: 1, description: "Shirt", quantity: 5, packed: false },
  { id: 2, description: "Pants", quantity: 2, packed: false },
];

// ------------------------------------------------------
// LOGO
// ------------------------------------------------------
function Logo() {
  return <h1>My Travel List</h1>;
}

// ------------------------------------------------------
// FORM
// ------------------------------------------------------
function Form({ setItems }) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newItem = {
      id: uuidv4(),
      description: description.trim(),
      quantity,
      packed: false,
    };

    setItems((items) => [...items, newItem]);
    setDescription("");
    setQuantity(1);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>What do you need to pack?</h3>

      <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <option value={num} key={num}>
            {num}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Item..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit">Add</button>
    </form>
  );
}

// ------------------------------------------------------
// SEARCH + FILTER + SORT CONTROLS
// ------------------------------------------------------
function Controls({
  filter,
  setFilter,
  sort,
  setSort,
  search,
  setSearch,
  items,
  toggleAllPacked,
  clearPacked,
  resetList,
}) {
  const allPacked = items.length > 0 && items.every((i) => i.packed);

  return (
    <div className="controls-wrap">
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Items</option>
          <option value="packed">Packed</option>
          <option value="unpacked">Unpacked</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="az">Sort: A → Z</option>
          <option value="za">Sort: Z → A</option>
          <option value="qty-high">Quantity: High → Low</option>
          <option value="qty-low">Quantity: Low → High</option>
          <option value="packed-first">Packed First</option>
        </select>
      </div>

      <div className="actions">
        <button onClick={toggleAllPacked} className="action-btn">
          {allPacked ? "Unpack All" : "Pack All"}
        </button>

        <button onClick={clearPacked} className="action-btn warn">
          Clear Packed
        </button>

        <button onClick={resetList} className="action-btn danger">
          Reset List
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// INDIVIDUAL CARD ITEM
// ------------------------------------------------------
function Item({ item, deleteItem, togglePacked }) {
  return (
    <li className={`card ${item.packed ? "packed" : ""}`}>
      <div className="card-top">
        <input
          type="checkbox"
          checked={item.packed}
          onChange={() => togglePacked(item.id)}
        />

        <span className="card-text">
          {item.description} <strong>({item.quantity})</strong>
        </span>
      </div>

      <button className="delete-btn" onClick={() => deleteItem(item.id)}>
        ✕
      </button>
    </li>
  );
}

// ------------------------------------------------------
// LIST
// ------------------------------------------------------
function PackingList({ items, deleteItem, togglePacked }) {
  if (items.length === 0) {
    return (
      <div className="empty">
        <p>No items yet</p>
        <span>Please continue shopping / adding!</span>
      </div>
    );
  }

  return (
    <ul className="card-grid">
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          deleteItem={deleteItem}
          togglePacked={togglePacked}
        />
      ))}
    </ul>
  );
}

// ------------------------------------------------------
// STATS + PROGRESS BAR
// ------------------------------------------------------
function Stats({ items }) {
  const packed = items.filter((i) => i.packed).length;
  const total = items.length;
  const percentage = total === 0 ? 0 : Math.round((packed / total) * 100);

  return (
    <footer className="stats">
      <div className="stats-text">
        <em>
          You packed {packed}/{total} items ({percentage}%).
        </em>
      </div>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
      </div>
    </footer>
  );
}

// ------------------------------------------------------
// MAIN APP
// ------------------------------------------------------
export default function App() {
  // Load from localStorage if available
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("travel_items");
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("az");
  const [search, setSearch] = useState("");

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("travel_items", JSON.stringify(items));
  }, [items]);

  const togglePacked = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleAllPacked = () => {
    const allPacked = items.length > 0 && items.every((i) => i.packed);
    setItems((prev) => prev.map((i) => ({ ...i, packed: !allPacked })));
  };

  const clearPacked = () => {
    setItems((prev) => prev.filter((i) => !i.packed));
  };

  const resetList = () => {
    setItems([]);
    setSearch("");
    setFilter("all");
    setSort("az");
  };

  // FILTER + SEARCH + SORT combined
  const visibleItems = useMemo(() => {
    let result = items;

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.description.toLowerCase().includes(q));
    }

    // filter
    result = result.filter((item) => {
      if (filter === "packed") return item.packed;
      if (filter === "unpacked") return !item.packed;
      return true;
    });

    // sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "az":
          return a.description.localeCompare(b.description);
        case "za":
          return b.description.localeCompare(a.description);
        case "qty-high":
          return b.quantity - a.quantity;
        case "qty-low":
          return a.quantity - b.quantity;
        case "packed-first":
          return Number(b.packed) - Number(a.packed);
        default:
          return 0;
      }
    });

    return result;
  }, [items, search, filter, sort]);

  return (
    <div className="app">
      <Logo />
      <Form setItems={setItems} />

      <div className="list">
        <Controls
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
          items={items}
          toggleAllPacked={toggleAllPacked}
          clearPacked={clearPacked}
          resetList={resetList}
        />

        <PackingList
          items={visibleItems}
          deleteItem={deleteItem}
          togglePacked={togglePacked}
        />
      </div>

      <Stats items={items} />
    </div>
  );
}
