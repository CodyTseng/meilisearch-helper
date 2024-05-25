export type FilterQuery<FilterableAttributes extends string> = {
  [P in FilterableAttributes]?: Condition;
} & LogicalSelector<FilterableAttributes> &
  GeoSelector;

export function buildMeiliSearchFilter<FilterableAttributes extends string>(
  filterQuery:
    | FilterQuery<FilterableAttributes>
    | FilterQuery<FilterableAttributes>[],
): string;

export type Sort<SortableAttributes extends string> = {
  [K in SortableAttributes]?: SortDirection;
} & {
  _geoPoint?: {
    lat: number;
    lng: number;
    direction?: SortDirection;
  };
};

export function buildMeiliSearchSort<SortableAttributes extends string>(
  sort: Sort<SortableAttributes>,
): string[];

type ComparisonSelector = {
  $eq?: BaseValueTypes;
  $ne?: BaseValueTypes;
  $gt?: ComparableValueTypes;
  $gte?: ComparableValueTypes;
  $lt?: ComparableValueTypes;
  $lte?: ComparableValueTypes;
  $in?: BaseValueTypes[];
  $nin?: BaseValueTypes[];
  $exists?: boolean;
  $empty?: boolean;
};

type GeoSelector = {
  $geoRadius?: {
    lat: number;
    lng: number;
    distanceInMeters: number;
  };
  $geoRoundingBox?: {
    topRight: {
      lat: number;
      lng: number;
    };
    bottomLeft: {
      lat: number;
      lng: number;
    };
  };
};

type LogicalSelector<K extends string> = {
  $or?: FilterQuery<K>[];
  $and?: FilterQuery<K>[];
};

type BaseValueTypes = string | number | boolean | Date | null;
type ComparableValueTypes = number | Date;

type Condition = BaseValueTypes | BaseValueTypes[] | ComparisonSelector;

type SortDirection = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';
