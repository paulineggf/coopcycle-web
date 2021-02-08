<?php

namespace AppBundle\Entity\Task;

use AppBundle\Action\Task\RecurrenceRuleBetween as BetweenController;
use AppBundle\Validator\Constraints\RecurrenceRuleTemplate as AssertRecurrenceRuleTemplate;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiProperty;
use Gedmo\Timestampable\Traits\Timestampable;
use Recurr\Rule;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ApiResource(
 *   shortName="TaskRecurrenceRule",
 *   normalizationContext={"groups"={"task_recurrence_rule"}},
 *   collectionOperations={
 *     "get"={
 *       "method"="GET",
 *       "security"="is_granted('ROLE_ADMIN')"
 *     },
 *     "post"={
 *       "method"="POST",
 *       "security"="is_granted('ROLE_ADMIN')"
 *     }
 *   },
 *   itemOperations={
 *     "get"={
 *       "method"="GET",
 *       "security"="is_granted('ROLE_ADMIN')"
 *     },
 *     "put"={
 *       "method"="PUT",
 *       "security"="is_granted('ROLE_ADMIN')"
 *     },
 *     "between"={
 *       "method"="POST",
 *       "path"="/task_recurrence_rules/{id}/between",
 *       "security"="is_granted('ROLE_ADMIN')",
 *       "controller"=BetweenController::class
 *     }
 *   }
 * )
 */
class RecurrenceRule
{
    use Timestampable;

    /**
     * @var int
     */
    private $id;

    /**
     * @var Rule
     * @Groups({"task_recurrence_rule"})
     * @ApiProperty(
     *     attributes={
     *         "openapi_context"={
     *             "type"="string",
     *             "example"="FREQ=WEEKLY"
     *         }
     *     }
     * )
     */
    private $rule;

    /**
     * @var \DateTimeInterface
     * @Groups({"task_recurrence_rule"})
     */
    private $startDate;

    /**
     * @var \DateTimeInterface
     * @Groups({"task_recurrence_rule"})
     */
    private $endDate;

    /**
     * @var array
     * @Groups({"task_recurrence_rule"})
     * @AssertRecurrenceRuleTemplate
     */
    private $template = [];

    // running, cancelled
    private $state;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return Rule
     */
    public function getRule()
    {
        return $this->rule;
    }

    /**
     * @param Rule $rule
     *
     * @return self
     */
    public function setRule(Rule $rule)
    {
        $this->rule = $rule;

        return $this;
    }

    /**
     * @return \DateTimeInterface
     */
    public function getStartDate()
    {
        return $this->startDate;
    }

    /**
     * @param \DateTimeInterface $startDate
     *
     * @return self
     */
    public function setStartDate(\DateTimeInterface $startDate)
    {
        $this->startDate = $startDate;

        return $this;
    }

    /**
     * @return \DateTimeInterface
     */
    public function getEndDate()
    {
        return $this->endDate;
    }

    /**
     * @param \DateTimeInterface $endDate
     *
     * @return self
     */
    public function setEndDate(\DateTimeInterface $endDate)
    {
        $this->endDate = $endDate;

        return $this;
    }

    /**
     * @return array
     */
    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * @param array $template
     *
     * @return self
     */
    public function setTemplate(array $template)
    {
        $this->template = $template;

        return $this;
    }
}
