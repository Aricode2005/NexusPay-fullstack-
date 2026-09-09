export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="bg-gray-100 p-5 rounded-2xl mb-5">
          <Icon className="w-10 h-10 text-gray-300" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
