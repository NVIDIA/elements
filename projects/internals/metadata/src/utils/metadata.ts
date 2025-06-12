export type MetadataMethod<T> = {
  (...args: any[]): Promise<T>; // eslint-disable-line @typescript-eslint/no-explicit-any
  metadata?: {
    description?: string;
    params?: { [key: string]: { type: string; description: string } };
    name?: string;
  };
};

export function metadata({
  description,
  params
}: {
  description: string;
  params?: { [key: string]: { type: string; description: string } };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (originalMethod: MetadataMethod<any>, _context: ClassMethodDecoratorContext) {
    const name = `elements_${originalMethod.name}`;
    const metadata = {
      description: description,
      params,
      name
    };
    Object.assign(originalMethod, { metadata });
    return originalMethod;
  };
}
