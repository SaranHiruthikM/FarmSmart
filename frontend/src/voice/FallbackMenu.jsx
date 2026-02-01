import Card from "../components/Card";

export default function FallbackMenu({ onNavigate }) {
  const items = [
    { label: "Search", icon: "/icons/search.svg", screen: "SEARCH" },
    { label: "Listings", icon: "/icons/listing.svg", screen: "LISTING" },
    { label: "Prices", icon: "/icons/price.svg", screen: "PRICE" },
    { label: "Offers", icon: "/icons/offer.svg", screen: "OFFERS" },
    { label: "Logistics", icon: "/icons/truck.svg", screen: "LOGISTICS" },
    { label: "Help", icon: "/icons/help.svg", screen: "HELP" }
  ];

  return (
    <Card>
      <div className="grid-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid-item"
            onClick={() => onNavigate(item.screen)}
          >
            <img src={item.icon} width="20" />
            <div className="grid-item-label">{item.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
