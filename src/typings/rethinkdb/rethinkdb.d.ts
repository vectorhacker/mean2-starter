// Type definitions for Rethinkdb 2.10.0
// Project: http://rethinkdb.com/
// Reference: http://www.rethinkdb.com/api/#js
// TODO: Document manipulation and below

declare module "rethinkdb" {
    import Promise = require('bluebird');

    //This should have worked: type FieldType = string|number|boolean|Object|Array<FieldType>;
    type FieldType = any;
    type Literal = any;

    interface EventEmitter {
        addListener(event: string, listener: Function);
        on(event: string, listener: Function);
        once(event: string, listener: Function);
        removeListener(event: string, listener: Function);
        removeAllListeners(event?: string);
        setMaxListeners(n: number);
        listeners(event: string);
        emit(event: string, ...args: any[]);
    }

    //#region Options

    interface ConnectionOptions {
        host?: string; //default 'localhost'
        port?: number; //default 28015
        db?: string; //default 'test'
        authKey?: string;
        timeout?: number; //in seconds, default 20
        ssl?: { caCerts: string }; //path to certificate
    }

    interface TableCreateOptions {
        primaryKey?: string; //default: "id"
        shards?: number; //1-32
        replicas?: number| { [serverTag: string]: number };
        primaryReplicaTag?: string;
        nonvotingReplicaTags?: string[];
        durability?: string; // "soft" or "hard" defualt: "hard"
    }
    interface Repair {
        emergencyRepair: string; //"unsafe_rollback" "unsafe_rollback_or_erase"
    }

    interface TableReconfigureOptions {
        shards?: number; //1-32
        replicas?: number| { [serverTag: string]: number };
        primaryReplicaTag?: string;
        dryRun?: boolean;
    }

    interface TableOptions {
        readMode?: string; // "single" "majority" "outdated"
        identifierFormat?: string; //"name" "uuid";
    }

    interface DeleteOptions {
        returnChanges: boolean|string; //true, false or "always" default: false
        durability?: string; // "soft" or "hard" defualt: table
    }

    interface InsertOptions extends DeleteOptions {
        conflict?: string; //"error" "replace" "update"
    }

    interface UpdateOptions extends DeleteOptions {
        nonAtomic?: boolean;
    }
    
    interface RunOptions {
        useOutdated?: boolean; //default false
        timeFormat?: string; //'native' or 'raw', default 'native'
        profile?: boolean; //default false
        durability?: string; //'hard' or 'soft'
        groupFormat?: string; //'native' or 'raw', default 'native'
        noreply?: boolean; //default false
        db?: string;
        arrayLimit?: number; //default 100,000
        binaryFormat?: string; // 'native' or 'raw', default 'native'
        minBatchRows?: number; //default 8
        maxBatchRow?: number; //default unlimited
        maxBatchBytes?: number; //default 1MB
        maxBatchSeconds?: number; //default 0.5
        firstBatchScaledownFactor?: number; //default 4
    }

    interface HttpRequestOptions {
        //General
        timeout?: number;//default 30
        reattempts?: number;//default 5
        redirects?: number; //default 1
        verify?: boolean;// default true
        resultFormat: string;//"text" "json" "jsonp" "binary" "auto"

        //Request Options
        method?: string;// "GET" "POST" "PUT" "PATCH" "DELETE" "HEAD"
        params?: Object;
        header?: { [key: string]: string|Object };
        data?: Object;
        //Pagination
        page?: string|((param: Single<{ params: Object, header: Object, body: Object }>) => (string|Single<string>));
        pageLimit: number; //-1 = no limit.
        
    }

    interface WaitOptions {
        waitFor?: string; //"ready_for_outdated_reads", "ready_for_reads", "ready_for_writes", "all_replicas_ready" default "ready_for_writes"
        timeout?: number;
    }

    //#endregion

    //#region Results
    interface Buffer { }
    interface Geometry { 
        // '$reql_type$': string,
        // coordinates: any[],
        // type: string
    }
    interface Line extends Geometry {
        coordinates: number[][]
     }
    interface Point extends Geometry {
        coordinates: number[]
     }
    interface Polygon extends Geometry { }

    interface ValueChange<T> {
        old_val?: any;
        new_val?: any;
    }

    interface DBChangeResult {
        config_changes: ValueChange<{
            id: string;
            name: string;
        }>[];
        tables_dropped: number;
        dbs_created: number;
        dbs_dropped: number;
    }

    interface DBConfig {
        id: string,
        name: string
    }

    interface TableChangeResult {
        tablesCreated?: number;
        tablesDropped?: number;
        configChanges: ValueChange<TableConfig>;
    }

    interface TableShard {
        primary_replica: string;
        replicas: string[];
        nonvoting_replicas: string[];
    }

    interface TableConfig {
        id: string;
        name: string;
        db: string;
        primary_key: string; //default: "id"
        shards: TableShard[];
        indexes: string[];
        write_acks: string;
        durability: string; // "soft" or "hard" defualt: "hard"
    }
    interface TableStatus extends TableConfig {
        status: {
            all_replicas_ready: boolean;
            ready_for_outdated_reads: boolean;
            ready_for_reads: boolean;
            ready_for_writes: boolean;
        }
    }
    interface IndexStatus {
        function: Buffer;
        geo: boolean;
        index: string;
        multi: boolean;
        outdated: boolean;
        ready: boolean;
    }

    interface WriteResult<T> {
        inserted: number;
        replaced: number;
        unchanged: number;
        errors: number;
        first_error?: string;
        deleted: number;
        generated_keys?: string[];
        warnings: string[];
        changes: ValueChange<T>;
    }

    interface Changes<T> extends ValueChange<T> {
        state?: string, //'initializing', 'ready'. cant come together with values
    }

    interface JoinResult<T1, T2> {
        left: T1;
        right: T2;
    }

    interface GroupResults<T> {
        group: FieldType;
        reduction: T;
    }

    interface MatchResults {
        start: number;
        end: number;
        str: string;
        groups: Array<{
            start: number;
            end: number;
            str: string;
        }>;
    }

    interface Feed<T> extends EventEmitter {
        each(cb: (err: Error, row: T) => boolean|void, onFinishedCallback?: (err: Error) => void);

        //events can be 'data' and 'error'
    }

    interface Cursor<T> extends Feed<T> {
        next(cb: (err: Error, row: T) => void);
        next(): Promise<T>;

        toArray(cb: (err: Error, array: Array<T>) => void);
        toArray(): Promise<Array<T>>;

        close();
    }

    //#endregion

    interface Connection extends EventEmitter {
        close(wait: { noreplyWait: boolean }, cb: (err: Error) => void);
        close(cb: (err: Error) => void);

        close(wait?: { noreplyWait: boolean }): Promise<void>;

        reconnect(wait: { noreplyWait: boolean }, cb: (err: Error) => void);
        reconnect(cb: (err: Error) => void);

        reconnect(wait?: { noreplyWait: boolean }): Promise<void>;

        use(dbName: string);

        noreplyWait(cb: (err: Error) => void);
        noreplyWait(): Promise<void>;

        //events can be connect, close, timeout and error.
    }

    interface Database {
        tableCreate(tableName: string, options: TableOptions): Single<TableChangeResult>;
        tableDrop(tableName: string): Single<TableChangeResult>;
        tableList(): Stream<string>;
        table<T>(tableName: string): Table<T>;

        config(): Single<DBConfig>;
        rebalance(): Single<{ rebalanced: number, status_changes: ValueChange<TableStatus>[] }>;
        reconfigure(options: TableReconfigureOptions): Single<{ reconfigured: number, config_changes: ValueChange<TableConfig>[], status_changes: ValueChange<TableStatus>[] }>;
        wait(options: WaitOptions): Single<{ ready: number }>;
    }
    
    interface IndexOptions {
        multi?: boolean
        geo?: boolean
    }

    interface Table<T> extends Stream<T> {
        indexCreate(indexName: string, indexFunction?: Single<T>|Single<T>[]|SingleFactory<T>, options?: IndexOptions): Single<{ created: number }>;
        indexCreate(indexName: string, options?: IndexOptions): Single<{ created: number }>;

        indexDrop(indexName: string): Single<{ dropped: number }>;
        indexList(): Stream<string>;
        indexRename(oldName: string, newName: string, options?: { overwrite: boolean }): Single<{ renamed: number }>;
        indexStatus(...indexName: string[]): Stream<IndexStatus>;
        indexWait(...indexName: string[]): Stream<IndexStatus>;

        insert(obj: T, options?: InsertOptions): Single<WriteResult<T>>;
        insert(obj1: T, obj2: T, options?: InsertOptions): Single<WriteResult<T>>;
        insert(obj1: T, obj2: T, obj3: T, options?: InsertOptions): Single<WriteResult<T>>;
        insert(obj1: T, obj2: T, obj3: T, obj4: T, options?: InsertOptions): Single<WriteResult<T>>;

        get(key: FieldType): Single<T>;
        getAll(key: FieldType, options?: { index: string }): Stream<T>;
        getAll(key1: FieldType, key2: FieldType, options?: { index: string }): Stream<T>;
        getAll(key1: FieldType, key2: FieldType, key3: FieldType, options?: { index: string }): Stream<T>;
        getAll(key1: FieldType, key2: FieldType, key3: FieldType, key4: FieldType, options?: { index: string }): Stream<T>;

        between(lowKey: FieldType, highKey: FieldType, options?: { index?: string, leftBound?: string, rightBound?: string }): Stream<T>;
        getIntersecting(geometry: Single<Geometry>, index: { index: string }): Stream<T>;
        getNearest(geometry: Single<Point>, options: { index: string, maxResults?: number, maxDist?: number, unit?: string, geoSystem?: string }): Stream<T>;

        distinct(index?: { index: string }): Stream<any>;

        config(): Single<TableConfig>;
        rebalance(): Single<{ rebalanced: number, status_changes: ValueChange<TableStatus>[] }>;

        reconfigure(options: TableReconfigureOptions): Single<{ reconfigured: number, config_changes: ValueChange<TableConfig>[], status_changes: ValueChange<TableStatus>[] }>;
        reconfigure(options: Repair): Single<{ reconfigured: number, config_changes: ValueChange<TableConfig>[], status_changes: ValueChange<TableStatus>[] }>;
        status(): Single<TableStatus>;

        sync();
        wait(options: WaitOptions): Single<{ ready: number }>;
    }

    interface Stream<T> {
        (attribute: string): Stream<any>;
        default(value: any): Stream<T>;

        changes(options?: { squash?: boolean|number, includeStates?: boolean }): Stream<Changes<T>>;
        update(obj: T|SingleFactory<T>, options?: UpdateOptions): Single<WriteResult<T>>;
        replace(obj: T|SingleFactory<T>, options?: UpdateOptions): Single<WriteResult<T>>;
        delete(options?: DeleteOptions): Single<WriteResult<T>>;

        //FROM

        innerJoin<T2>(other: Stream<T2>, predicate: (doc1: Single<T>, doc2: Single<T2>) => boolean|Single<boolean>): Stream<JoinResult<T, T2>>;
        outerJoin<T2>(other: Stream<T2>, predicate: (doc1: Single<T>, doc2: Single<T2>) => boolean|Single<boolean>): Stream<JoinResult<T, T2>>; //actually left join
        eqJoin<T2>(fieldOrPredicate: string|((doc1: Single<T>) => boolean|Single<boolean>), rightTable: string, options?: { index: string });

        zip<TZipped>(): Stream<TZipped>;

        union<T2>(other: Stream<T2>): Stream<T|T2>;

        map<TMapped>(mapFunction: (doc: Single<T>) => any): Stream<TMapped>;
        map<TMapped, T1>(stream1: Stream<T1>, mapFunction: (doc: Single<T>, doc1: Single<T1>) => any): Stream<TMapped>;
        map<TMapped, T1, T2>(stream1: Stream<T1>, stream2: Stream<T2>, mapFunction: (doc: Single<T>, doc1: Single<T1>, doc2: Single<T2>) => any): Stream<TMapped>;
        map<TMapped, T1, T2, T3>(stream1: Stream<T1>, stream2: Stream<T2>, stream3: Stream<T3>, mapFunction: (doc: Single<T>, doc1: Single<T1>, doc2: Single<T2>, doc3: Single<T3>) => any): Stream<TMapped>;

        concatMap<TMapped>(mapFunction: (doc: Single<T>) => any): Stream<TMapped>;

        //WHERE

        withFields(...fields: string[]): Stream<T>; //subset of T
        hasFields(...fields: string[]): Stream<T>;
        filter(predicate: Predicate<T>|Object, options?: { default: FieldType }): Stream<T>;
        includes(geometry: Single<Geometry>): Stream<Geometry>;
        intersects(geometry: Single<Geometry>): Stream<Geometry>;

        //LOGIC
        contains(value: FieldType|Predicate<T>): Single<boolean>;

        //ORDER BY
        orderBy(field: string|Single<T>|SingleFactory<T>, index?: { index: string }): Stream<T>;
        orderBy(field1: string|Single<T>|SingleFactory<T>, field2: string|Single<T>|SingleFactory<T>, index?: { index: string }): Stream<T>;
        orderBy(field1: string|Single<T>|SingleFactory<T>, field2: string|Single<T>|SingleFactory<T>, field3: string|Single<T>|SingleFactory<T>, index?: { index: string }): Stream<T>;
        orderBy(field1: string|Single<T>|SingleFactory<T>, field2: string|Single<T>|SingleFactory<T>, field3: string|Single<T>|SingleFactory<T>, field4: string|Single<T>|SingleFactory<T>, index?: { index: string }): Stream<T>;

        //GROUP
        group(field: string|Single<T>|SingleFactory<T>, index?: { index?: string; multi?: boolean }): GrouppedStreamArray<T>;
        group(field1: string|Single<T>|SingleFactory<T>, field2: string|Single<T>|SingleFactory<T>, index?: { index?: string; multi?: boolean }): GrouppedStreamArray<T>;
        group(field1: string|Single<T>|SingleFactory<T>, field2: string|Single<T>|SingleFactory<T>, field3: string|Single<T>|SingleFactory<T>, index?: { index?: string; multi?: boolean }): GrouppedStreamArray<T>;
        group(field1: string|Single<T>|SingleFactory<T>, field2: string|Single<T>|SingleFactory<T>, field3: string|Single<T>|SingleFactory<T>, field4: string|Single<T>|SingleFactory<T>, index?: { index?: string; multi?: boolean }): GrouppedStreamArray<T>;

        //SELECT FUNCTIONS
        count(value?: FieldType|Predicate<T>): Single<number>;
        sum(value?: FieldType|Predicate<T>): Single<number>;
        avg(value?: FieldType|Predicate<T>): Single<number>;
        min(value?: FieldType|Predicate<T>): Single<T>;
        max(value?: FieldType|Predicate<T>): Single<T>;
        reduce(reduceFunction: (left: Single<T>, right: Single<T>) => Single<T>): Single<T>;

        //SELECT
        distinct(): Stream<any>; //Should be T and in Table should be FieldType but they don't work because of inheritance
        pluck(...fieldNames: string[]): Stream<T>; //subset of T
        without(...fieldNames: string[]): Stream<T>; //subset of T
        getField(fieldName: string): Stream<T>; //one field of T
        merge<TOut>(...objects: Single<any>[]): Stream<TOut>;
        merge<TOut>(func: SingleFactory<T>): Stream<TOut>;

        skip(n: number): Stream<T>;
        limit(n: number): Stream<T>;
        slice(start: number, end?: number, options?: { leftBound: string, rightBound: string }): Stream<T>;
        nth(n: number): Single<T>;
        sample(n: number): Stream<T>;
        offsetOf(single: Single<T>|Predicate<T>): Single<number>;

        isEmpty(): Single<boolean>;

        forEach(func: (res: Single<T>) => Single<WriteResult<any>>): Stream<WriteResult<any>>;

        coerceTo(t: string): Single<any>;//"array" "string" "number" "object"
        typeOf(): Single<string>;
        info(): Single<Object>;

        run(conn: Connection, options?: RunOptions): Promise<Cursor<T>>;
        run(conn: Connection, options: RunOptions, cb: (err: Error, result: Cursor<T>) => void);
        run(conn: Connection, cb: (err: Error, result: Cursor<T>) => void);
    }

    interface GrouppedStream<T> {
        ungroup(): Stream<GroupResults<T>>;

        run(conn: Connection, options?: RunOptions): Promise<Cursor<GroupResults<T>>>;
        run(conn: Connection, options: RunOptions, cb: (err: Error, result: Cursor<GroupResults<T>>) => void);
        run(conn: Connection, cb: (err: Error, result: Cursor<GroupResults<T>>) => void);

    }

    interface GrouppedStreamArray<T> extends GrouppedStream<T[]> {
        count(value?: FieldType|Predicate<T>): GrouppedStream<number>;
        sum(value?: FieldType|Predicate<T>): GrouppedStream<number>;
        avg(value?: FieldType|Predicate<T>): GrouppedStream<number>;
        min(value?: FieldType|Predicate<T>): GrouppedStream<T>;
        max(value?: FieldType|Predicate<T>): GrouppedStream<T>;
        distinct(): GrouppedStreamArray<T>;
        contains(): GrouppedStream<boolean>;
        reduce(reduceFunction: (left: Single<T>, right: Single<T>) => Single<T>): Single<T>;
    }

    interface Single<T> extends Stream<T> { //single can have all stream functions when T is Array
        (attribute: string|number): Single<any>;
        default(value: any): Single<T>;
        hasFields(...fields: string[]): Single<T>;
        //Works only if T is an array
        append(value: FieldType): Single<T>;
        prepend(value: FieldType): Single<T>;
        difference(value: Array<FieldType>|Single<T[]>): Single<T>;
        setInsert(value: FieldType): Single<T>;
        setUnion(value: FieldType): Single<T>;
        setIntersection(value: Array<FieldType>|Single<T[]>): Single<T>;
        setDifference(value: Array<FieldType>|Single<T[]>): Single<T>;
        insertAt(index: number, value: FieldType): Single<T>;
        changeAt(index: number, value: FieldType): Single<T>;
        spliceAt(index: number, value: Array<FieldType>|Single<T[]>): Single<T>;
        deleteAt(index: number, endIndex?: number);
        //Works only if T is a string
        match(regexp: string): Single<MatchResults>;
        split(seperator: string, maxSplits?: number): Single<string[]>;
        upcase(): Single<string>;
        downcase(): Single<string>;
        add(...str: Array<string|Single<string>>): Single<string>;
        gt(...value: Array<string|Single<string>>): Single<boolean>;
        ge(...value: Array<string|Single<string>>): Single<boolean>;
        lt(...value: Array<string|Single<string>>): Single<boolean>;
        le(...value: Array<string|Single<string>>): Single<boolean>;
        //Works only for numbers
        add(...num: Array<number|Single<number>>): Single<number|Date>;
        sub(...num: Array<number|Single<number>|Date|Single<Date>>): Single<number|Date>;
        mul(...num: Array<number|Single<number>>): Single<T|number>;
        div(...num: Array<number|Single<number>>): Single<number>;
        mod(...num: Array<number|Single<number>>): Single<number>;
        gt(...value: Array<number|Single<number>>): Single<boolean>;
        ge(...value: Array<number|Single<number>>): Single<boolean>;
        lt(...value: Array<number|Single<number>>): Single<boolean>;
        le(...value: Array<number|Single<number>>): Single<boolean>;
        round(): Single<number>;
        ceil(): Single<number>;
        floor(): Single<number>;
        //Works only for bool
        and(...bool: Array<boolean|Single<boolean>>): Single<boolean>;
        or(...bool: Array<boolean|Single<boolean>>): Single<boolean>;
        not(): Single<boolean>;
        //Works only for Date
        inTimezone(timezone: string): Single<Date>;
        timezone(): Single<string>;
        during(start: Date|Single<Date>, end: Date|Single<Date>, options?: { leftBound: string, rightBound: string }): Single<boolean>;
        date(): Single<Date>;
        timeOfDay(): Single<number>;
        year(): Single<number>;
        month(): Single<number>;
        day(): Single<number>;
        dayOfWeek(): Single<number>;
        dayOfYear(): Single<number>;
        hours(): Single<number>;
        minutes(): Single<number>;
        seconds(): Single<number>;
        toISO8601: Single<string>;
        toEpochTime: Single<number>;
        //Works only for geo
        distance(geo: Single<Geometry>, options: { geoSystem: string, unit: string }): Single<number>;
        toGeojson(): Single<Object>;
        includes(geometry: Single<Geometry>): Single<boolean>;
        intersects(geometry: Single<Geometry>): Single<boolean>;
        //Works only for line
        fill(): Single<Polygon>;
        polygonSub(polygon2: Single<Polygon>): Single<Polygon>;


        toJsonString(): Single<string>;
        toJSON(): Single<string>;

        eq(...value: Array<FieldType|Single<any>>): Single<boolean>;
        ne(...value: Array<FieldType|Single<any>>): Single<boolean>;
        

        keys(): Single<string[]>;

        do<TOut>(func: (res: Single<T>) => TOut): TOut;

        run(conn: Connection, options?: RunOptions): Promise<T>;
        run(conn: Connection, options: RunOptions, cb: (err: Error, result: T) => void);
        run(conn: Connection, cb: (err: Error, result: T) => void);
    }

    interface Predicate<T> {
        (doc: Single<T>): boolean|Single<boolean>;
    }
    interface SingleFactory<T> {
        (doc: Single<T>): any;
    }

    export function connect(options: ConnectionOptions, cb: (err: Error, conn: Connection) => void);
    export function connect(host: string, cb: (err: Error, conn: Connection) => void);
    export function connect(options: ConnectionOptions): Promise<Connection>;
    export function connect(host: string): Promise<Connection>;
    export function use(dbName: string);

    export function dbCreate(dbName: string): Single<DBChangeResult>;
    export function dbDrop(dbName: string): Single<DBChangeResult>;
    export function dbList(): Stream<string>;
    export function db(dbName: string): Database;
    
    //For default database
    export function tableCreate(tableName: string, options: TableCreateOptions): Single<TableChangeResult>;
    export function tableDrop(tableName: string): Single<TableChangeResult>;
    export function tableList(): Stream<string>;
    export function table<T>(tableName: string, options?: TableOptions): Table<T>;
    //additional
    export function map<TMapped, T1>(stream1: Stream < T1 >, mapFunction: (doc1: Single<T1>) => any): Stream<TMapped>;
    export function map<TMapped, T1, T2>(stream1: Stream < T1 >, stream2: Stream < T2 >, mapFunction: (doc1: Single<T1>, doc2: Single<T2>) => any): Stream<TMapped>;
    export function map<TMapped, T1, T2, T3>(stream1: Stream<T1>, stream2: Stream<T2>, stream3: Stream<T3>, mapFunction: (doc1: Single<T1>, doc2: Single<T2>, doc3: Single<T3>) => any): Stream<TMapped>;

    export function row(name: string): Single<FieldType>;
    export function literal(any): Literal;
    export function object(...keyValue: any[]): Single<any>; //should be (key: string, value: any...)
    export function and(...bool: Array<boolean|Single<boolean>>): Single<boolean>;
    export function or(...bool: Array<boolean|Single<boolean>>): Single<boolean>;
    export function not(bool: boolean|Single<boolean>): Single<boolean>;
    export function random(lowBound?: number, highBound?: number, options?: { float: boolean }): Single<number>;
    export function round(num: number|Single<number>): Single<number>;
    export function ceil(bool: number|Single<number>): Single<number>;
    export function floor(bool: number|Single<number>): Single<number>;
    export function now(): Single<Date>;
    export function time(year: number, month: number, day: number, hour: number, minute: number, second: number, timezone: string): Single<Date>;
    export function time(year: number, month: number, day: number, timezone: string): Single<Date>;
    export function epochTime(epochTime: number): Single<Date>;
    export function ISO8601(time: string, options?: { defaultTimezone: string }): Single<Date>;
    export function args<T>(arg: T[]): T;
    export function binary(data: any): Buffer;
    //export  "do"
    export function branch(test: Single<boolean>, true_branch: any, false_branch: any): Stream<any>;
    export function range(): Stream<number>;
    export function range(endValue: number): Stream<number>;
    export function range(startValue: number, endValue: number): Stream<number>;
    export function error(message?: string): any;
    export function expr<T>(val: T): Single<T>;
    export function js(js: string): Single<any>;
    export function json(json: string): Single<Object>;
    export function http(url: string, options: HttpRequestOptions): Single<Object>;
    export function uuid(): Single<string>;
    export function circle(longitudeLatitude: string[]|Point, radius: number, options: { numVertices: number, geoSystem: string, unit: string, fill: boolean }): Single<Geometry>;
    export function line(...points: Single<Point>[]): Single<Line>;
    export function line(...longitudeLatitudes: string[][]): Single<Line>;
    export function point(longitude: string, latitude: string): Single<Point>;
    export function polygon(...points: Single<Point>[]): Single<Polygon>;
    export function polygon(...longitudeLatitudes: string[][]): Single<Polygon>;

    export function geojson(GeoJSON: Object): Single<Geometry>;
    export function distance(geo1: Single<Geometry>, geo2: Single<Geometry>, options: { geoSystem: string, unit: string }): Single<number>;
    export function intersects(stream: Stream<Geometry>, geometry: Single<Geometry>): Stream<Geometry>;
    export function intersects(geometry1: Single<Geometry>, geometry2: Single<Geometry>): Single<boolean>;
    export function wait(options: WaitOptions): Single<{ ready: number }>;

    export var minval: any;
    export var maxval: any;
}
