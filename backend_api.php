<?php
// ✅ Allow requests from anywhere
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ DB connection
$host = "localhost";
$dbname = "u240376517_propdb";
$username = "u240376517_propdb";
$password = "Y*Q;5gIOp2";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// ✅ POST: Update response/remark
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = isset($data['id']) ? intval($data['id']) : 0;
    $remark = isset($data['remark']) ? trim($data['remark']) : null;
    $response = isset($data['response']) ? trim($data['response']) : null;

    if ($id > 0 && ($remark !== null || $response !== null)) {
        $fields = [];
        $params = [];
        $types = '';

        if ($remark !== null) {
            $fields[] = "remark = ?";
            $params[] = $remark;
            $types .= 's';
        }
        if ($response !== null) {
            $fields[] = "response = ?";
            $params[] = $response;
            $types .= 's';
        }

        $params[] = $id;
        $types .= 'i';

        $sql = "UPDATE gov_properties SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Update failed"]);
        }

        $stmt->close();
        $conn->close();
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing ID or no data to update"]);
        exit();
    }
}

// ✅ GET: Fetch properties with filters
$minLat = isset($_GET['minLat']) ? floatval($_GET['minLat']) : 0;
$maxLat = isset($_GET['maxLat']) ? floatval($_GET['maxLat']) : 0;
$minLng = isset($_GET['minLng']) ? floatval($_GET['minLng']) : 0;
$maxLng = isset($_GET['maxLng']) ? floatval($_GET['maxLng']) : 0;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$where = isset($_GET['where']) ? trim($_GET['where']) : '';
$type = isset($_GET['type']) ? trim($_GET['type']) : '';
$minSize = isset($_GET['min_size']) ? floatval($_GET['min_size']) : 0;
$maxSize = isset($_GET['max_size']) ? floatval($_GET['max_size']) : 0;
$sizeRange = isset($_GET['size_range']) ? trim($_GET['size_range']) : '';
$responseStatus = isset($_GET['response_status']) ? trim($_GET['response_status']) : '';
$hasContact = isset($_GET['has_contact']) ? $_GET['has_contact'] : '';

$sql = "SELECT * FROM gov_properties WHERE 1=1";
$params = [];
$types = "";

// ✅ If no search — apply map boundaries
if (empty($search)) {
    $sql .= " AND Lat BETWEEN ? AND ? AND `Long` BETWEEN ? AND ?";
    $params[] = $minLat;
    $params[] = $maxLat;
    $params[] = $minLng;
    $params[] = $maxLng;
    $types .= "dddd";
}

// ✅ If search present
if (!empty($search)) {
    $searchLike = "%" . $search . "%";

    if (!empty($where)) {
        // 🔹 Specific column search
        $allowed = ["AuthorityArea", "ColonyName", "OwnerName", "Address1", "MobileNo", "pkPropertyId", "PID", "PropertyCategory", "PropertyType", "PropertySubType", "McName", "KhasaraNo", "PlotNo"];
        if (in_array($where, $allowed)) {
            $sql .= " AND {$where} LIKE ?";
            $params[] = $searchLike;
            $types .= "s";
        }
    } else {
        // 🔹 Default: search everywhere
        $sql .= " AND (
            AuthorityArea LIKE ? OR 
            ColonyName LIKE ? OR 
            OwnerName LIKE ? OR 
            Address1 LIKE ? OR 
            MobileNo LIKE ? OR 
            pkPropertyId LIKE ? OR 
            PID LIKE ? OR
            PropertyType LIKE ? OR
            PropertySubType LIKE ? OR
            McName LIKE ? OR
            KhasaraNo LIKE ? OR
            PlotNo LIKE ?
        )";
        for ($i = 0; $i < 12; $i++) {
            $params[] = $searchLike;
            $types .= "s";
        }
    }
}

// ✅ Type filter if set
if (!empty($type)) {
    $sql .= " AND PropertyCategory = ?";
    $params[] = $type;
    $types .= "s";
}

// ✅ Size range filter - predefined ranges
if (!empty($sizeRange)) {
    switch ($sizeRange) {
        case 'below_80':
            $sql .= " AND PlotSize < 80";
            break;
        case '80_to_110':
            $sql .= " AND PlotSize >= 80 AND PlotSize < 110";
            break;
        case '110_to_140':
            $sql .= " AND PlotSize >= 110 AND PlotSize < 140";
            break;
        case '140_to_180':
            $sql .= " AND PlotSize >= 140 AND PlotSize < 180";
            break;
        case '180_to_250':
            $sql .= " AND PlotSize >= 180 AND PlotSize < 250";
            break;
        case '250_to_300':
            $sql .= " AND PlotSize >= 250 AND PlotSize < 300";
            break;
        case '300_to_450':
            $sql .= " AND PlotSize >= 300 AND PlotSize < 450";
            break;
        case '450_to_600':
            $sql .= " AND PlotSize >= 450 AND PlotSize < 600";
            break;
        case '600_to_1000':
            $sql .= " AND PlotSize >= 600 AND PlotSize < 1000";
            break;
        case '1000_to_1500':
            $sql .= " AND PlotSize >= 1000 AND PlotSize < 1500";
            break;
        case '1500_plus':
            $sql .= " AND PlotSize >= 1500";
            break;
        case 'custom':
            // Custom range will be handled by minSize and maxSize parameters
            break;
    }
}

// ✅ Size filter if set (custom range)
if ($minSize > 0) {
    $sql .= " AND PlotSize >= ?";
    $params[] = $minSize;
    $types .= "d";
}
if ($maxSize > 0) {
    $sql .= " AND PlotSize <= ?";
    $params[] = $maxSize;
    $types .= "d";
}

// ✅ Response status filter
if (!empty($responseStatus)) {
    $sql .= " AND response = ?";
    $params[] = $responseStatus;
    $types .= "s";
}

// ✅ Contact availability filter
if ($hasContact === 'true') {
    $sql .= " AND MobileNo IS NOT NULL AND MobileNo != ''";
} elseif ($hasContact === 'false') {
    $sql .= " AND (MobileNo IS NULL OR MobileNo = '')";
}

$sql .= " LIMIT 1000";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$properties = [];
while ($row = $result->fetch_assoc()) {
    $row['DueDetails'] = json_decode($row['DueDetails'], true);
    $row['LocationsDataJson'] = json_decode($row['LocationsDataJson'], true);
    $properties[] = $row;
}

echo json_encode($properties);
$conn->close();
?>
