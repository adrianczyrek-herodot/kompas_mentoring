/** Średnia ocena z gwiazdką albo plakietka „Nowy” dla mentora bez ocen. */
export function Rating({ value }: { value: number }) {
  if (value <= 0) {
    return <span className="inline-flex items-center rounded-full bg-warn-soft px-[9px] py-0.5 text-[0.74rem] font-semibold whitespace-nowrap text-warn">Nowy</span>;
  }
  return (
    <span className="font-semibold">
      <span className="text-accent">★</span> {value.toFixed(1)}
    </span>
  );
}
