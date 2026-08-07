namespace HospitalQueueAPI.DTOs.Admin;

public class DashboardResponseDto
{
    public int TotalPatients { get; set; }

    public int TotalDoctors { get; set; }

    public int TotalDepartments { get; set; }

    public int TotalAppointments { get; set; }

    public int TodayAppointments { get; set; }

    public int WaitingPatients { get; set; }

    public int ServingPatients { get; set; }

    public int CompletedPatients { get; set; }

    public double AverageWaitTime { get; set; }
}