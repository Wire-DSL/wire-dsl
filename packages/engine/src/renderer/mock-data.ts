// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================
// Deterministic mock data for idempotent rendering

const MOCK_NAMES = ['Juan', 'María', 'Carlos', 'Sofia', 'Alex', 'Luna', 'Diego', 'Emma'];
const MOCK_LAST_NAMES = [
  'García',
  'López',
  'Rodríguez',
  'Martínez',
  'Pérez',
  'Sánchez',
  'Torres',
  'Flores',
];
const MOCK_STATUSES = ['Active', 'Pending', 'Completed', 'On Hold', 'Review', 'Approved'];
const MOCK_STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const MOCK_EMAILS = [
  'juan@example.com',
  'maria@example.com',
  'carlos@example.com',
  'sofia@example.com',
  'alex@example.com',
  'luna@example.com',
];
const MOCK_CITIES = [
  'Buenos Aires',
  'Madrid',
  'Bogota',
  'Santiago',
  'Ciudad de Mexico',
  'Lima',
  'Barcelona',
  'Monterrey',
];
const MOCK_PRODUCTS = [
  'Laptop Pro',
  'Wireless Mouse',
  'Mechanical Keyboard',
  '4K Monitor',
  'USB-C Hub',
  'Noise-Canceling Headphones',
];
const MOCK_PAYMENT_STATUS = ['Paid', 'Pending', 'Failed', 'Refunded'];

export class MockDataGenerator {
  private static customMocks: Record<string, string[]> = {};
  private static HEADER_TO_MOCK: Record<string, string> = {
    id: 'id',
    user: 'name',
    usuario: 'name',
    name: 'name',
    nombre: 'name',
    fullname: 'full_name',
    full_name: 'full_name',
    email: 'email',
    correo: 'email',
    city: 'city',
    ciudad: 'city',
    country: 'country',
    pais: 'country',
    region: 'region',
    amount: 'amount',
    importe: 'amount',
    total: 'amount',
    price: 'price',
    costo: 'price',
    status: 'status',
    estado: 'status',
    payment_status: 'payment_status',
    stage: 'stage',
    etapa: 'stage',
    company: 'company',
    account: 'account',
    product: 'product',
    producto: 'product',
    device: 'device',
    priority: 'priority',
    time: 'time',
    updated: 'updated',
    owner: 'owner',
    contact: 'contact',
    requester: 'requester',
  };

  /**
   * Set custom mocks from project metadata
   * Accepts string (comma-separated) or string[] values; ignores others.
   * Format: { "status": "Active,Pending,Completed", "stage": ["Lead","Won","Lost"] }
   */
  static setCustomMocks(mocks: Record<string, unknown>): void {
    this.customMocks = {};
    for (const [key, rawValues] of Object.entries(mocks)) {
      let values: string[] = [];

      if (typeof rawValues === 'string') {
        values = rawValues
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      } else if (Array.isArray(rawValues)) {
        values = rawValues
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
          .filter((v) => v.length > 0);
      }

      if (values.length > 0) {
        this.customMocks[key.toLowerCase()] = values;
      }
    }
  }

  /**
   * Get deterministic mock data by type and index
   */
  static getMockValue(type: string, index: number, random: boolean = false): string {
    const normalizedType = type.toLowerCase().trim();

    // Check custom mocks first
    if (this.customMocks[normalizedType]) {
      return this.pick(this.customMocks[normalizedType], index, random);
    }

    switch (normalizedType) {
      case 'id':
        return random ? this.randomInt(1, 9999).toString() : (index + 1).toString();
      case 'name':
      case 'owner':
      case 'contact':
      case 'requester':
      case 'user':
        return this.pick(MOCK_NAMES, index, random);
      case 'last_name':
        return this.pick(MOCK_LAST_NAMES, index, random);
      case 'full_name':
      case 'fullname':
        return `${this.pick(MOCK_NAMES, index, random)} ${this.pick(MOCK_LAST_NAMES, index + 3, random)}`;
      case 'email':
        return this.pick(MOCK_EMAILS, index, random);
      case 'status':
        return this.pick(MOCK_STATUSES, index, random);
      case 'stage':
        return this.pick(MOCK_STAGES, index, random);
      case 'payment_status':
        return this.pick(MOCK_PAYMENT_STATUS, index, random);
      case 'city':
        return this.pick(MOCK_CITIES, index, random);
      case 'price':
      case 'cost':
        return random
          ? `$${(this.randomInt(5_000, 250_000) / 100).toFixed(2)}`
          : `$${((index + 1) * 99.99).toFixed(2)}`;
      case 'amount':
        return random
          ? `$${this.randomInt(1_000, 95_000).toLocaleString()}`
          : `$${((index + 1) * 5000).toLocaleString()}`;
      case 'account':
      case 'company':
        return `Company ${random ? this.randomInt(1, 100) : index + 1}`;
      case 'product':
        return this.pick(MOCK_PRODUCTS, index, random);
      case 'country':
      case 'region':
        return this.pick(['USA', 'Spain', 'Mexico', 'Argentina', 'Chile'], index, random);
      case 'device':
        return this.pick(['Desktop', 'Mobile', 'Tablet'], index, random);
      case 'time':
      case 'updated':
        return `${random ? this.randomInt(1, 24) : 2 + (index % 20)}h ago`;
      case 'priority':
        return this.pick(['High', 'Medium', 'Low'], index, random);
      default:
        // If starts with "literal:", return the literal value
        if (normalizedType.startsWith('literal:')) {
          return type.substring(8);
        }
        return `Item ${index + 1}`;
    }
  }

  static inferMockTypeFromColumn(columnName: string): string {
    const normalized = columnName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!normalized) return 'item';
    return this.HEADER_TO_MOCK[normalized] || normalized || 'item';
  }

  /**
   * Parse mock string and return list of values
   * Formats:
   *   "name" → ["Juan", "María", "Carlos", ...]
   *   "id" → ["1", "2", "3", ...]
   *   "literal:No data" → ["No data", "No data", ...]
   */
  static generateMockList(mockType: string, count: number, random: boolean = false): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.getMockValue(mockType, i, random));
    }
    return result;
  }

  /**
   * Generate a row of mock data for a table given column types
   * columns: "id,name,status,amount"
   */
  static generateMockRow(columns: string, rowIndex: number, random: boolean = false): Record<string, string> {
    const columnNames = columns.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};

    columnNames.forEach((col) => {
      const mockType = this.inferMockTypeFromColumn(col);
      row[col] = this.getMockValue(mockType, rowIndex, random);
    });

    return row;
  }

  /**
   * Generate multiple mock rows for a table
   */
  static generateMockRows(columns: string, rowCount: number, random: boolean = false): Record<string, string>[] {
    const rows: Record<string, string>[] = [];
    for (let i = 0; i < rowCount; i++) {
      rows.push(this.generateMockRow(columns, i, random));
    }
    return rows;
  }

  private static pick(values: string[], index: number, random: boolean): string {
    if (values.length === 0) return '';
    if (random) {
      const randomIndex = this.randomInt(0, values.length - 1);
      return values[randomIndex];
    }
    return values[index % values.length];
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
