package com.scorecast.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

@Entity
@Table(
        name = "predictions",
        uniqueConstraints = @UniqueConstraint(name = "uk_prediction_student_match", columnNames = {"student_id", "match_id"})
)
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private ChampionshipMatch match;

    @Column(name = "pred_home")
    private Integer predHome;

    @Column(name = "pred_away")
    private Integer predAway;

    @Column(name = "points_awarded", nullable = false)
    private int pointsAwarded;

    public UUID getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public ChampionshipMatch getMatch() {
        return match;
    }

    public void setMatch(ChampionshipMatch match) {
        this.match = match;
    }

    public Integer getPredHome() { return predHome; }
    public void setPredHome(Integer predHome) { this.predHome = predHome; }

    public Integer getPredAway() { return predAway; }
    public void setPredAway(Integer predAway) { this.predAway = predAway; }

    public int getPointsAwarded() {
        return pointsAwarded;
    }

    public void setPointsAwarded(int pointsAwarded) {
        this.pointsAwarded = pointsAwarded;
    }
}
