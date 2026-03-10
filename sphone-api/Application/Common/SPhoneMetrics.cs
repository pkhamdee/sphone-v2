using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace SPhone.Application.Common;

/// <summary>
/// Central place for all sPhone custom OTel metrics and activity source.
/// Uses only System.Diagnostics — no dependency on Infrastructure.
/// </summary>
public static class SPhoneMetrics
{
    public const string ServiceName = "sphone-api";

    public static readonly ActivitySource ActivitySource = new(ServiceName);

    private static readonly Meter Meter = new(ServiceName);

    public static readonly Counter<long> OrdersCreated = Meter.CreateCounter<long>(
        "sphone.orders.created",
        description: "Total number of installment orders created");

    public static readonly Counter<long> CustomersRegistered = Meter.CreateCounter<long>(
        "sphone.customers.registered",
        description: "Total number of customers registered");

    public static readonly Histogram<double> InstallmentAmountThb = Meter.CreateHistogram<double>(
        "sphone.order.installment_amount_thb",
        unit: "THB",
        description: "Distribution of monthly installment amounts in THB");

    public static readonly Histogram<double> OrderTotalThb = Meter.CreateHistogram<double>(
        "sphone.order.total_amount_thb",
        unit: "THB",
        description: "Distribution of total order amounts in THB");
}
