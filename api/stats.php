<?php
/**
 * api/stats.php — Statistiques dashboard (admin uniquement)
 */
require_once __DIR__ . '/bootstrap.php';

Auth::requireAdmin();

$productModel  = new Product();
$orderModel    = new Order();
$feedbackModel = new Feedback();

Response::json([
    'success'        => true,
    'totalProducts'  => $productModel->count(),
    'totalOrders'    => $orderModel->count(),
    'totalFeedbacks' => $feedbackModel->count(),
    'totalRevenue'   => $orderModel->totalRevenue(),
]);
