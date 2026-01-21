// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================
// Deterministic mock data for idempotent rendering

const MOCK_NAMES = ['Juan', 'María', 'Carlos', 'Sofia', 'Alex', 'Luna', 'Diego', 'Emma'];
const MOCK_LAST_NAMES = ['García', 'López', 'Rodríguez', 'Martínez', 'Pérez', 'Sánchez', 'Torres', 'Flores'];
const MOCK_STATUSES = ['Active', 'Pending', 'Completed', 'On Hold', 'Review', 'Approved'];
const MOCK_STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const MOCK_EMAILS = ['juan@example.com', 'maria@example.com', 'carlos@example.com', 'sofia@example.com', 'alex@example.com', 'luna@example.com'];

export class MockDataGenerator {
  private static customMocks: Record<string, string[]> = {};

  /**
   * Set custom mocks from project metadata
   * Format: { "status": "Active,Pending,Completed", "stage": "Lead,Won,Lost" }
   */
  static setCustomMocks(mocks: Record<string, string>): void {
    this.customMocks = {};
    for (const [key, values] of Object.entries(mocks)) {
      this.customMocks[key.toLowerCase()] = values
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);
    }
  }

  /**
   * Get deterministic mock data by type and index
   */
  static getMockValue(type: string, index: number): string {
    const normalizedType = type.toLowerCase().trim();

    // Check custom mocks first
    if (this.customMocks[normalizedType]) {
      return this.customMocks[normalizedType][index % this.customMocks[normalizedType].length];
    }

    switch (normalizedType) {
      case 'id':
        return (index + 1).toString();
      case 'name':
      case 'owner':
      case 'contact':
      case 'requester':
      case 'user':
        return MOCK_NAMES[index % MOCK_NAMES.length];
      case 'last_name':
        return MOCK_LAST_NAMES[index % MOCK_LAST_NAMES.length];
      case 'full_name':
      case 'fullname':
        return `${MOCK_NAMES[index % MOCK_NAMES.length]} ${MOCK_LAST_NAMES[index % MOCK_LAST_NAMES.length]}`;
      case 'email':
        return MOCK_EMAILS[index % MOCK_EMAILS.length];
      case 'status':
        return MOCK_STATUSES[index % MOCK_STATUSES.length];
      case 'stage':
        return MOCK_STAGES[index % MOCK_STAGES.length];
      case 'price':
      case 'cost':
        return `$${((index + 1) * 99.99).toFixed(2)}`;
      case 'amount':
        return `$${((index + 1) * 5000).toLocaleString()}`;
      case 'account':
      case 'company':
        return `Company ${index + 1}`;
      case 'country':
      case 'region':
        return ['USA', 'EU', 'APAC', 'LATAM'][index % 4];
      case 'device':
        return ['Desktop', 'Mobile', 'Tablet'][index % 3];
      case 'time':
      case 'updated':
        return `${2 + (index % 20)}h ago`;
      case 'priority':
        return ['High', 'Medium', 'Low'][index % 3];
      default:
        // If starts with "literal:", return the literal value
        if (normalizedType.startsWith('literal:')) {
          return type.substring(8);
        }
        return `Item ${index + 1}`;
    }
  }

  /**
   * Parse mock string and return list of values
   * Formats:
   *   "name" → ["Juan", "María", "Carlos", ...]
   *   "id" → ["1", "2", "3", ...]
   *   "literal:No data" → ["No data", "No data", ...]
   */
  static generateMockList(mockType: string, count: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.getMockValue(mockType, i));
    }
    return result;
  }

  /**
   * Generate a row of mock data for a table given column types
   * columns: "id,name,status,amount"
   */
  static generateMockRow(columns: string, rowIndex: number): Record<string, string> {
    const columnNames = columns.split(',').map(c => c.trim());
    const row: Record<string, string> = {};

    columnNames.forEach((col) => {
      row[col] = this.getMockValue(col, rowIndex);
    });

    return row;
  }

  /**
   * Generate multiple mock rows for a table
   */
  static generateMockRows(columns: string, rowCount: number): Record<string, string>[] {
    const rows: Record<string, string>[] = [];
    for (let i = 0; i < rowCount; i++) {
      rows.push(this.generateMockRow(columns, i));
    }
    return rows;
  }
}
